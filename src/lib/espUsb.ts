/**
 * Pure Web Serial Manager for ESP32-S3 over direct USB Cable.
 * Native browser API in Chrome & Edge with sub-millisecond response.
 */

class Esp32UsbSerialManager {
  private port: any = null;
  private writer: any = null;
  private isConnected: boolean = false;
  private listeners: ((connected: boolean) => void)[] = [];

  public isSupported(): boolean {
    return 'serial' in navigator;
  }

  public getConnected(): boolean {
    return this.isConnected;
  }

  public addListener(cb: (connected: boolean) => void) {
    this.listeners.push(cb);
  }

  public removeListener(cb: (connected: boolean) => void) {
    this.listeners = this.listeners.filter(l => l !== cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.isConnected));
  }

  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      alert('Web Serial is supported on Google Chrome, Microsoft Edge, and Opera on Mac/PC.');
      return false;
    }

    try {
      // Prompt user to pick ESP32 USB device
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 115200 });
      this.writer = this.port.writable.getWriter();
      this.isConnected = true;
      this.notify();
      console.log('[USB] ESP32-S3 Connected over USB Serial at 115200 baud.');
      return true;
    } catch (err: any) {
      console.warn('[USB] Port connection canceled or failed:', err);
      this.isConnected = false;
      this.notify();
      return false;
    }
  }

  public async sendCommand(command: string): Promise<boolean> {
    if (!this.isConnected || !this.writer) {
      console.log(`[USB Simulation] Hardware not paired. Simulated: '${command}'`);
      return false;
    }

    try {
      const encoder = new TextEncoder();
      await this.writer.write(encoder.encode(command.trim() + '\n'));
      console.log(`[USB SENT] '${command}'`);
      return true;
    } catch (err) {
      console.error('[USB ERROR] Failed to send command:', err);
      return false;
    }
  }

  public async triggerScan(): Promise<void> {
    await this.sendCommand('SCAN');
  }

  public async triggerOff(): Promise<void> {
    await this.sendCommand('OFF');
  }

  public async triggerReset(): Promise<void> {
    await this.sendCommand('RESET');
  }

  public async triggerTest(): Promise<void> {
    await this.sendCommand('TEST');
  }
}

export const espUsb = new Esp32UsbSerialManager();
