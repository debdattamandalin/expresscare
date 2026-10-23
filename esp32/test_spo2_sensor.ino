/*
 * =========================================================================
 * MAX30100 / MAX30102 Diagnostic & Test Scanner for ESP32-S3
 * =========================================================================
 * 
 * Required Library in Arduino IDE:
 *   - Search and install: "SparkFun MAX3010x Pulse and Proximity Sensor Library"
 * 
 * Pin Connections to ESP32-S3:
 *   - Sensor VIN / VCC -> ESP32 3V3 (3.3V)
 *   - Sensor GND       -> ESP32 GND
 *   - Sensor SDA       -> ESP32 GPIO 8 (default SDA)
 *   - Sensor SCL       -> ESP32 GPIO 9 (default SCL)
 * 
 * Instructions:
 *   1. Upload this sketch to your ESP32-S3.
 *   2. Open Serial Monitor at 115200 baud.
 *   3. It will scan the I2C bus to check if the chip is physically detected.
 *   4. Put your finger on the sensor glass:
 *      - You should see the RED LED inside the sensor illuminate.
 *      - The Serial Monitor will print live IR and RED photodiode readings!
 * =========================================================================
 */

#include <Wire.h>
#include "MAX30105.h"

#define I2C_SDA_PIN 8
#define I2C_SCL_PIN 9

MAX30105 particleSensor;

void scanI2CDevices() {
  Serial.println("\n--- Step 1: Scanning I2C Bus on GPIO 8 (SDA) & GPIO 9 (SCL) ---");
  byte count = 0;
  for (byte i = 1; i < 127; i++) {
    Wire.beginTransmission(i);
    if (Wire.endTransmission() == 0) {
      Serial.printf("  [FOUND] I2C device active at address 0x%02X", i);
      if (i == 0x57) {
        Serial.print("  <-- This is the MAX30100 / MAX30102 / MAX30105 sensor!");
      } else if (i == 0x5A) {
        Serial.print("  <-- This is the MLX90614 IR Temperature sensor!");
      }
      Serial.println();
      count++;
    }
  }
  if (count == 0) {
    Serial.println("  [WARNING] No I2C devices found! Check 3.3V, GND, SDA, and SCL wiring.");
  } else {
    Serial.printf("Total %d device(s) found on bus.\n", count);
  }
  Serial.println("----------------------------------------------------------------\n");
}

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000); // Wait up to 3s for serial port
  delay(1000);

  Serial.println("\n=============================================");
  Serial.println("  ESP32-S3 MAX3010x Live Hardware Diagnostic ");
  Serial.println("=============================================");

  // Initialize I2C on ESP32-S3 pins
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  delay(200);

  // 1. Scan bus first to see if hardware acknowledges electrical connection
  scanI2CDevices();

  // 2. Attempt to initialize sensor library
  Serial.println("--- Step 2: Initializing Sensor Registers ---");
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("[ERROR] MAX3010x not responding via library.");
    Serial.println("Possible causes:");
    Serial.println("  1. Bad solder joint or loose jumper wire.");
    Serial.println("  2. Some clones require pull-up resistors (4.7k) on SDA/SCL.");
    Serial.println("  3. Board running at 5V instead of 3.3V.");
    Serial.println("\nWill continue listening to raw I2C every 2 seconds...");
  } else {
    Serial.println("[SUCCESS] MAX3010x sensor initialized successfully!");
    
    // Configure sensor LEDs and photodiode
    byte ledBrightness = 60; // 0=Off to 255=50mA
    byte sampleAverage = 4;  // Options: 1, 2, 4, 8, 16, 32
    byte ledMode = 2;        // 1 = Red only, 2 = Red + IR, 3 = Red + IR + Green
    int sampleRate = 100;    // Options: 50, 100, 200, 400, 800, 1000, 1600, 3200
    int pulseWidth = 411;    // Options: 69, 118, 215, 411
    int adcRange = 4096;     // Options: 2048, 4096, 8192, 16384

    particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
    particleSensor.setPulseAmplitudeRed(0x1F); // Turn Red LED on to test optics
    particleSensor.setPulseAmplitudeGreen(0);  // Turn off Green if MAX30105
    
    Serial.println("\n>>> SENSOR ACTIVE! The optical LED should now glow red.");
    Serial.println(">>> Place your finger on the sensor. Live readings below:\n");
  }
}

unsigned long lastPrint = 0;

void loop() {
  // If sensor is active, read raw optical photodiode channels
  long irValue = particleSensor.getIR();
  long redValue = particleSensor.getRed();

  if (millis() - lastPrint >= 250) { // Print 4 times a second
    lastPrint = millis();

    if (irValue > 50000) {
      Serial.printf("[FINGER DETECTED]  IR: %-7ld  RED: %-7ld  (Sensor is WORKING!)\n", irValue, redValue);
    } else if (irValue > 0) {
      Serial.printf("[IDLE / NO FINGER] IR: %-7ld  RED: %-7ld  (Place finger flat on sensor)\n", irValue, redValue);
    } else {
      // Re-scan if library didn't attach
      scanI2CDevices();
    }
  }
}
