import { espUsb } from './espUsb';

class Esp32HardwareManager {
  public async connect(): Promise<boolean> {
    return await espUsb.connect();
  }

  public isConnected(): boolean {
    return espUsb.getConnected();
  }

  public async triggerScan(): Promise<void> {
    await espUsb.triggerScan();
  }

  public async triggerOff(): Promise<void> {
    await espUsb.triggerOff();
  }

  public async triggerReset(): Promise<void> {
    await espUsb.triggerReset();
  }

  public async runTest(): Promise<{ success: boolean; message: string }> {
    if (!espUsb.getConnected()) {
      return { 
        success: false, 
        message: 'USB not connected yet. Click "Connect ESP32 USB Cable" first!' 
      };
    }
    await espUsb.triggerTest();
    return { success: true, message: 'TEST command sent through USB cable! RGB LED should flash.' };
  }
}

export const espHardware = new Esp32HardwareManager();
