export interface SerialService {
  connect(baudRate?: number): Promise<void>;
  disconnect(): void;
  send(command: string): void;
  onReceive(callback: (data: string) => void): void;
  onConnectionChange(callback: (connected: boolean) => void): void;
  isConnected(): boolean;
}
