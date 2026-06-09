import type { SerialService } from './SerialService';

export class MockSerialService implements SerialService {
  private receiveCallback: ((data: string) => void) | null = null;
  private connectionCallback: ((connected: boolean) => void) | null = null;
  private connected = false;

  async connect(baudRate = 115200): Promise<void> {
    console.log(`[Mock] connect @ ${baudRate} baud`);
    await new Promise<void>((r) => setTimeout(r, 500));
    this.connected = true;
    this.connectionCallback?.(true);

    // Simule un ping initial
    setTimeout(() => this.receiveCallback?.('PONG'), 600);
  }

  disconnect(): void {
    console.log('[Mock] disconnect');
    this.connected = false;
    this.connectionCallback?.(false);
  }

  send(command: string): void {
    console.log(`[Mock] send: ${command}`);
    // Simule la réponse de l'ESP32
    setTimeout(() => {
      if (command === 'PING') {
        this.receiveCallback?.('PONG');
      } else if (command === 'STATE?') {
        this.receiveCallback?.('VAL:TEMP_D:20.0');
        this.receiveCallback?.('VAL:TEMP_P:20.0');
        this.receiveCallback?.('VAL:FAN:2');
      } else {
        this.receiveCallback?.('OK');
      }
    }, 80);
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
