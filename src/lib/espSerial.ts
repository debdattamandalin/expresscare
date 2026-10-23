/**
 * Web Serial Manager to communicate with ESP32-S3 over USB Serial.
 * Zero-install: Works in modern Chrome & Edge directly from browser.
 * Sends command strings:
 *   "SCAN\n"  -> triggers fast-blinking RED RGB LED for ~5s, then solid GREEN
 *   "RESET\n" -> resets to idle / blue
 */

class Esp32SerialManager {
  private port: any = null;
  private writer: any = null;
  private isConnected: boolean = false;

  public async connect(): Promise<boolean> {
    if (!('serial' in navigator)) {
      console.warn('Web Serial API not supported in this browser. Use Chrome or Edge.');
      return false;
    }

    try {
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 115200 });
      this.writer = this.port.writable.getWriter();
      this.isConnected = true;
      console.log('Connected to ESP32-S3 via Web Serial');
      return true;
    } catch (err) {
      console.error('Failed to connect to ESP32-S3 serial port:', err);
      return false;
    }
  }

  public async sendCommand(command: string): Promise<boolean> {
    if (!this.isConnected || !this.writer) {
      console.log(`[ESP32 Sim] Command '${command}' simulated (Hardware not physically connected via Web Serial)`);
      return false;
    }

    try {
      const encoder = new TextEncoder();
      await this.writer.write(encoder.encode(command + '\n'));
      return true;
    } catch (err) {
      console.error('Error sending command to ESP32:', err);
      return false;
    }
  }

  public async startScan(): Promise<void> {
    await this.sendCommand('SCAN');
  }

  public async resetLed(): Promise<void> {
    await this.sendCommand('RESET');
  }

  public getConnected(): boolean {
    return this.isConnected;
  }
}

export const espSerial = new Esp32SerialManager();
