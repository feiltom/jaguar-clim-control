/**
 * ESP32 — Passerelle USB Serial <-> CAN bus Jaguar XF
 * Carte  : LILYGO T-CAN485
 * Toolchain : PlatformIO
 *
 * Brochage :
 *   CAN TX  : GPIO 27 → transceiver SN65HVD230 intégré
 *   CAN RX  : GPIO 26 ← transceiver SN65HVD230 intégré
 *   CAN SE  : GPIO 23 → LOW pour activer le TX
 *   CAN H/L : bornes à vis → bus MS-CAN Jaguar (125 kbps)
 *   USB-C   : tablette Android (CH9102F @ 115200 baud)
 *
 * Source des CAN IDs : github.com/rhysmorgan134/jaguar-xf-canbus-app
 *
 * CAN IDs :
 *   0x2C8 (712) → commandes envoyées à la voiture (clim + radio)
 *   0x208 (520) ← état climatisation
 *
 * Commandes série (115200 baud) :
 *   PING          → PONG
 *   STATE?        → VAL:STATE:<n> TXERR:<n> RXERR:<n>
 *   RECOVER       → récupération bus-off
 *   CLIM?         → envoi forcé de l'état complet de la clim
 *
 *   TEMP:D:UP / TEMP:D:DOWN   — température conducteur
 *   TEMP:P:UP / TEMP:P:DOWN   — température passager
 *   FAN:UP / FAN:DOWN / FAN:ON — ventilation
 *   AUTO:1 / AUTO:0            — mode auto
 *   RECIRC:1 / RECIRC:0        — recirculation
 *   REAR:1 / REAR:0            — dégivrage arrière
 *   FRONT:1 / FRONT:0          — dégivrage avant
 *   DEFROST                    — dégivrage pare-brise
 *
 *   RADIO:1        — marche/arrêt radio (toggle)
 *   SRC            — changement de source
 *   MUSIC          — mode musique
 *   NEXT / PREV    — piste suivante / précédente
 *   VOL:UP / VOL:DOWN — volume
 *
 * Réponses CAN reçues :
 *   VAL:AUTO:<0|1>
 *   VAL:DEFROST:<0|1>
 *   VAL:FRONT_H:<0|1>
 *   VAL:REAR_H:<0|1>
 *   VAL:RECIRC:<0|1>
 */

#include <Arduino.h>
#include <FastLED.h>
#include "driver/twai.h"

// ─── LED RGB WS2812B (T-CAN485) ────────────────────────────────────────────
#define LED_PIN   4
#define LED_COUNT 1
CRGB leds[LED_COUNT];

void setLed(CRGB color) {
  leds[0] = color;
  FastLED.show();
}

// ─── Pins T-CAN485 ─────────────────────────────────────────────────────────
#define CAN_TX_PIN  GPIO_NUM_27
#define CAN_RX_PIN  GPIO_NUM_26
#define CAN_SE_PIN  23

// ─── CAN IDs ───────────────────────────────────────────────────────────────
#define CAN_ID_OUT   0x2C8
#define CAN_ID_CLIM  0x208

// ─── Buffer de sortie ──────────────────────────────────────────────────────
uint8_t canBuf[8] = {203, 0, 0, 0, 0, 0, 127, 127};

// ─── État clim (255 = inconnu) ─────────────────────────────────────────────
struct ClimState {
  uint8_t autoMode = 255;
  uint8_t defrost  = 255;
  uint8_t frontH   = 255;
  uint8_t rearH    = 255;
  uint8_t recirc   = 255;
} climState;

void printClimState() {
  Serial.print("VAL:AUTO:");    Serial.println(climState.autoMode);
  Serial.print("VAL:DEFROST:"); Serial.println(climState.defrost);
  Serial.print("VAL:FRONT_H:"); Serial.println(climState.frontH);
  Serial.print("VAL:REAR_H:");  Serial.println(climState.rearH);
  Serial.print("VAL:RECIRC:");  Serial.println(climState.recirc);
}

// ─── Config ────────────────────────────────────────────────────────────────
#define PULSE_MS    80
#define SERIAL_BAUD 115200
#define MAX_CMD_LEN 64

// ─── Buffer série ──────────────────────────────────────────────────────────
char cmdBuffer[MAX_CMD_LEN];
int  cmdIndex = 0;
unsigned long ledOffAt = 0;

// ─── Prototypes ────────────────────────────────────────────────────────────
void handleCommand(const String& cmd);
void handleCanRx(const twai_message_t& msg);
void sendCan();
void pulse(int byteIdx, uint8_t val, uint8_t offVal = 0);

// ─────────────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(SERIAL_BAUD);

  pinMode(CAN_SE_PIN, OUTPUT); digitalWrite(CAN_SE_PIN, LOW);

  FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, LED_COUNT);
  FastLED.setBrightness(80);
  setLed(CRGB::Black);

  twai_general_config_t g = TWAI_GENERAL_CONFIG_DEFAULT(CAN_TX_PIN, CAN_RX_PIN, TWAI_MODE_NORMAL);
  twai_timing_config_t  t = TWAI_TIMING_CONFIG_125KBITS();
  twai_filter_config_t  f = TWAI_FILTER_CONFIG_ACCEPT_ALL();

  if (twai_driver_install(&g, &t, &f) != ESP_OK) { Serial.println("ERR:CAN_INIT");  return; }
  if (twai_start()                    != ESP_OK) { Serial.println("ERR:CAN_START"); return; }

  setLed(CRGB::Green);
  Serial.println("READY");
}

// ─────────────────────────────────────────────────────────────────────────────
void loop() {
  unsigned long now = millis();
  if (ledOffAt && now >= ledOffAt) { setLed(CRGB::Green); ledOffAt = 0; }

  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\n' || c == '\r') {
      if (cmdIndex > 0) {
        cmdBuffer[cmdIndex] = '\0';
        handleCommand(String(cmdBuffer));
        setLed(CRGB::Red);
        ledOffAt = millis() + 80;
        cmdIndex = 0;
      }
    } else if (cmdIndex < MAX_CMD_LEN - 1) {
      cmdBuffer[cmdIndex++] = c;
    }
  }

  twai_message_t msg;
  if (twai_receive(&msg, 0) == ESP_OK) {
    handleCanRx(msg);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
void recoverBusOff() {
  twai_status_info_t status;
  twai_get_status_info(&status);
  if (status.state == TWAI_STATE_BUS_OFF) {
    Serial.println("WARN:BUS_OFF_RECOVER");
    twai_initiate_recovery();
    unsigned long t = millis();
    while (millis() - t < 500) {
      twai_get_status_info(&status);
      if (status.state == TWAI_STATE_RUNNING) { Serial.println("OK:BUS_RECOVERED"); return; }
      delay(10);
    }
    Serial.println("ERR:BUS_RECOVER_TIMEOUT");
  }
}

void sendCan() {
  recoverBusOff();
  twai_message_t msg = {};
  msg.identifier       = CAN_ID_OUT;
  msg.data_length_code = 8;
  memcpy(msg.data, canBuf, 8);
  esp_err_t err = twai_transmit(&msg, pdMS_TO_TICKS(10));
  if (err != ESP_OK) {
    Serial.printf("ERR:CAN_TX:%d\n", err);
    twai_status_info_t status;
    twai_get_status_info(&status);
    Serial.printf("ERR:STATE:%d TXERR:%d RXERR:%d\n",
      status.state, status.tx_error_counter, status.rx_error_counter);
  }
}

void pulse(int byteIdx, uint8_t val, uint8_t offVal) {
  setLed(CRGB::Blue);
  canBuf[byteIdx] = val;
  sendCan();
  delay(PULSE_MS);
  canBuf[byteIdx] = offVal;
  sendCan();
  setLed(CRGB::Green);
}

// ─────────────────────────────────────────────────────────────────────────────
void handleCommand(const String& cmd) {
  if (cmd == "PING")    { Serial.println("PONG"); return; }
  if (cmd == "RECOVER") { recoverBusOff(); return; }
  if (cmd == "CLIM?")   { printClimState(); return; }
  if (cmd == "STATE?") {
    twai_status_info_t s;
    twai_get_status_info(&s);
    Serial.printf("VAL:STATE:%d TXERR:%d RXERR:%d\n", s.state, s.tx_error_counter, s.rx_error_counter);
    return;
  }

  // Température conducteur
  if (cmd == "TEMP:D:UP")   { pulse(4, 1);        Serial.println("OK"); return; }
  if (cmd == "TEMP:D:DOWN") { pulse(4, 4);        Serial.println("OK"); return; }
  // Température passager
  if (cmd == "TEMP:P:UP")   { pulse(5, 1);        Serial.println("OK"); return; }
  if (cmd == "TEMP:P:DOWN") { pulse(5, 4);        Serial.println("OK"); return; }
  // Ventilation
  if (cmd == "FAN:UP")      { pulse(6, 128, 127); Serial.println("OK"); return; }
  if (cmd == "FAN:DOWN")    { pulse(6, 126, 127); Serial.println("OK"); return; }
  if (cmd == "FAN:ON")      { pulse(1, 4);        Serial.println("OK"); return; }
  // Modes clim
  if (cmd == "AUTO:1" || cmd == "AUTO:0")     { pulse(3, 1);       Serial.println("OK"); return; }
  if (cmd == "RECIRC:1" || cmd == "RECIRC:0") { pulse(1, 1);       Serial.println("OK"); return; }
  if (cmd == "REAR:1"   || cmd == "REAR:0")   { pulse(2, 64);      Serial.println("OK"); return; }
  if (cmd == "FRONT:1"  || cmd == "FRONT:0")  { pulse(2, 1);       Serial.println("OK"); return; }
  if (cmd == "DEFROST")                        { pulse(3, 4);       Serial.println("OK"); return; }
  // Radio
  if (cmd == "RADIO:1")  { pulse(3, 16);       Serial.println("OK"); return; }
  if (cmd == "SRC")      { pulse(3, 64);       Serial.println("OK"); return; }
  if (cmd == "MUSIC")    { pulse(1, 16);       Serial.println("OK"); return; }
  if (cmd == "NEXT")     { pulse(4, 16);       Serial.println("OK"); return; }
  if (cmd == "PREV")     { pulse(4, 64);       Serial.println("OK"); return; }
  if (cmd == "VOL:UP")   { pulse(7, 128, 127); Serial.println("OK"); return; }
  if (cmd == "VOL:DOWN") { pulse(7, 126, 127); Serial.println("OK"); return; }

  Serial.println("ERR:UNKNOWN_CMD");
}

// ─────────────────────────────────────────────────────────────────────────────
void handleCanRx(const twai_message_t& msg) {
  if (msg.identifier == CAN_ID_CLIM && msg.data_length_code >= 5) {
    uint8_t stateAutoMode   = (msg.data[3] & 32)  ? 1 : 0;
    uint8_t stateDefrost    = (msg.data[3] & 64)  ? 1 : 0;
    uint8_t stateFrontHeat  = (msg.data[3] & 128) ? 1 : 0;
    uint8_t stateRearHeat   = (msg.data[2] & 1)   ? 1 : 0;
    uint8_t stateRecirc     = (msg.data[4] & 32)  ? 1 : 0;

    bool isInitialFrame = (climState.autoMode == 255);

    if (isInitialFrame || stateAutoMode  != climState.autoMode) { climState.autoMode  = stateAutoMode;  Serial.print("VAL:AUTO:");    Serial.println(stateAutoMode);  }
    if (isInitialFrame || stateDefrost   != climState.defrost)  { climState.defrost   = stateDefrost;   Serial.print("VAL:DEFROST:"); Serial.println(stateDefrost);   }
    if (isInitialFrame || stateFrontHeat != climState.frontH)   { climState.frontH    = stateFrontHeat; Serial.print("VAL:FRONT_H:"); Serial.println(stateFrontHeat); }
    if (isInitialFrame || stateRearHeat  != climState.rearH)    { climState.rearH     = stateRearHeat;  Serial.print("VAL:REAR_H:");  Serial.println(stateRearHeat);  }
    if (isInitialFrame || stateRecirc    != climState.recirc)   { climState.recirc    = stateRecirc;    Serial.print("VAL:RECIRC:");  Serial.println(stateRecirc);    }
  }
}
