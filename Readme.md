# CarDashboard — Contrôle climatisation & radio Jaguar XF

Tablette Android embarquée dans une Jaguar XF, pilotant la climatisation et l'autoradio via le bus CAN MS-CAN (125 kbps) grâce à un ESP32 LILYGO T-CAN485 connecté en USB.

---

## Matériel requis

| Composant | Détail |
|-----------|--------|
| Tablette Android | Samsung SM-T500 (1024×600) |
| Microcontrôleur | LILYGO T-CAN485 (ESP32 + SN65HVD230) |
| Câble USB | USB-C ↔ USB-A (tablette → ESP32) |
| Connexion CAN | 2 fils sur le connecteur MS-CAN de la Jaguar |

---

## Brochage ESP32 (LILYGO T-CAN485)

| GPIO | Rôle |
|------|------|
| 27 | CAN TX → transceiver SN65HVD230 |
| 26 | CAN RX ← transceiver SN65HVD230 |
| 23 | CAN SE (standby — doit être LOW pour activer le TX) |
| 32 | Sortie GPIO NEXT (bouton volant suivant) |
| 33 | Sortie GPIO PREV (bouton volant précédent) |
| 4  | LED RGB WS2812B |

### LED d'état
| Couleur | Signification |
|---------|---------------|
| Vert | Prêt, bus CAN actif |
| Bleu | Trame CAN en cours d'envoi |
| Rouge (flash 80 ms) | Commande série reçue |

---

## Câblage Jaguar XF — Bus MS-CAN

> 📷 *Photo du câblage à venir*

- Bus MS-CAN : 125 kbps
- CAN ID de sortie : `0x2C8`
- CAN ID état clim : `0x208`

---

## Câblage autoradio

> 📷 *Photo du câblage à venir*

---

## Firmware ESP32

### Prérequis
- [PlatformIO](https://platformio.org/)
- Bibliothèque FastLED

### Flash
```bash
cd esp32
pio run --target upload
```

### Commandes série (115200 baud)

#### Diagnostic
| Commande | Réponse |
|----------|---------|
| `PING` | `PONG` |
| `STATE?` | `VAL:STATE:<n> TXERR:<n> RXERR:<n>` |
| `RECOVER` | Récupération bus-off |
| `CLIM?` | Envoi forcé de l'état complet de la clim |

#### Climatisation
| Commande | Action |
|----------|--------|
| `TEMP:D:UP` / `TEMP:D:DOWN` | Température conducteur |
| `TEMP:P:UP` / `TEMP:P:DOWN` | Température passager |
| `FAN:UP` / `FAN:DOWN` | Niveau ventilation |
| `FAN:ON` | Allumer ventilation |
| `AUTO:1` / `AUTO:0` | Mode automatique (toggle) |
| `RECIRC:1` / `RECIRC:0` | Recirculation (toggle) |
| `REAR:1` / `REAR:0` | Dégivrage arrière (toggle) |
| `FRONT:1` / `FRONT:0` | Dégivrage avant (toggle) |
| `DEFROST` | Dégivrage pare-brise |

#### Radio
| Commande | Action |
|----------|--------|
| `RADIO:1` | Marche/arrêt (toggle) |
| `SRC` | Changement de source |
| `NEXT` / `PREV` | Piste suivante / précédente |
| `VOL:UP` / `VOL:DOWN` | Volume |

### Données reçues du bus CAN
```
VAL:AUTO:<0|1>
VAL:DEFROST:<0|1>
VAL:FRONT_H:<0|1>
VAL:REAR_H:<0|1>
VAL:RECIRC:<0|1>
GPIO:NEXT / GPIO:PREV   ← commande volant détectée
```

---

## Application Android (CarDashboard)

- React Native 0.85.3 (bare, new architecture)
- Résolution cible : 1024×600
- Configurée comme launcher Android au démarrage
- Communication USB série via `react-native-usb-serialport-for-android` (driver CdcAcm pour CH9102F)
- Permission USB persistante via `device_filter.xml` (VID `0x1A86` / PID `0x55D4`)

### Build APK
```bash
cd android

# Bundle JS
node node_modules/.bin/react-native bundle \
  --platform android --dev true \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

# Build
cd android
./gradlew clean
./gradlew assembleDebug
```

APK produit : `android/android/app/build/outputs/apk/debug/app-debug.apk`

### Déploiement via ADB
```bash
# WiFi (tablette à 192.168.4.62:5555)
adb connect 192.168.4.62:5555
adb install -r android/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Structure du projet

```
jaguar-clim-control/
  android/          — application React Native (tablette)
  esp32/            — firmware LILYGO T-CAN485
  Readme.md
```
