import { UsbSerialManager, Parity, UsbSerial } from 'react-native-usb-serialport-for-android';
import type { SerialService } from './SerialService';

// CH9102F (WCH) VID = 0x1A86 = 6790
const CH9102_VENDOR_ID = 6790;

function toHex(text: string): string {
  return Array.from(text)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): string {
  const bytes = hex.match(/.{1,2}/g) ?? [];
  return bytes.map((b) => String.fromCharCode(parseInt(b, 16))).join('');
}

export class UsbSerialService implements SerialService {
  private port: UsbSerial | null = null;
  private receiveCallback: ((data: string) => void) | null = null;
  private connectionCallback: ((connected: boolean) => void) | null = null;
  private buffer = '';
  private connected = false;

  async connect(baudRate = 115200): Promise<void> {
    const devices = await UsbSerialManager.list();
    if (devices.length === 0) throw new Error('Aucun appareil USB détecté');

    const device =
      devices.find((d) => d.vendorId === CH9102_VENDOR_ID) ?? devices[0];

    const hasPermission = await UsbSerialManager.tryRequestPermission(device.deviceId);
    if (!hasPermission) throw new Error('Permission USB refusée');

    this.port = await UsbSerialManager.open(device.deviceId, {
      baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: Parity.None,
    });

    this.port.onReceived((event) => {
      const text = fromHex(event.data);
      this.buffer += text;
      const lines = this.buffer.split('\n');
      this.buffer = lines.pop() ?? '';
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed) this.receiveCallback?.(trimmed);
      });
    });

    this.connected = true;
    this.connectionCallback?.(true);
  }

  disconnect(): void {
    this.port?.close();
    this.port = null;
    this.connected = false;
    this.connectionCallback?.(false);
  }

  send(command: string): void {
    if (!this.port) return;
    this.port.send(toHex(`${command}\n`)).catch(console.error);
  }

  onReceive(callback: (data: string) => void): void {
    this.receiveCallback = callback;
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallback = callback;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
