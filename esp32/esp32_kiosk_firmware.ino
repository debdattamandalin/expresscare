// ============================================================
// ESP32-S3 EXPRESS CARE KIOSK — PURE USB SERIAL FIRMWARE
// Zero Wi-Fi. Zero Network config. Zero Drops.
// Receives ASCII commands over USB at 115200 baud:
//   "SCAN"  -> 10 seconds fast-blinking RED, then solid GREEN
//   "OFF"   -> Turn LED off (during AI chat)
//   "RESET" -> Turn LED to idle BLUE (waiting for next patient)
//   "TEST"  -> Quick 4x white flash
// ============================================================

#ifndef RGB_BUILTIN
  #define RGB_BUILTIN 48 // Default onboard WS2812 pin for ESP32-S3
#endif

enum LedState {
  STATE_IDLE,
  STATE_SCANNING,
  STATE_COMPLETED
};

LedState currentState = STATE_IDLE;
unsigned long scanStartTime = 0;
const unsigned long SCAN_DURATION_MS = 10000; // 10 seconds
unsigned long lastBlinkTime = 0;
bool blinkToggle = false;

void setRgbColor(uint8_t r, uint8_t g, uint8_t b) {
#ifdef RGB_BUILTIN
  rgbLedWrite(RGB_BUILTIN, r, g, b);
#endif
}

void triggerScan() {
  currentState = STATE_SCANNING;
  scanStartTime = millis();
  lastBlinkTime = millis();
  blinkToggle = true;
  setRgbColor(255, 0, 0); // Start with RED
  Serial.println("[ESP32] 10s Fast-blink RED scan started.");
}

void triggerOff() {
  currentState = STATE_IDLE;
  setRgbColor(0, 0, 0); // Turn LED off
  Serial.println("[ESP32] RGB LED turned OFF.");
}

void triggerReset() {
  currentState = STATE_IDLE;
  setRgbColor(0, 0, 40); // Dim BLUE = Idle & ready for next patient
  Serial.println("[ESP32] Returned to Idle (BLUE).");
}

void triggerTest() {
  Serial.println("[ESP32] Running quick test flash...");
  for (int i = 0; i < 4; i++) {
    setRgbColor(255, 255, 255);
    delay(100);
    setRgbColor(0, 0, 0);
    delay(100);
  }
  setRgbColor(0, 0, 40);
  Serial.println("[ESP32] Test complete.");
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=============================================");
  Serial.println("  ESP32-S3 Express Care (Pure USB Mode)      ");
  Serial.println("=============================================");
  Serial.println("Connected via USB Serial at 115200 baud.");
  Serial.println("Supported commands: SCAN, OFF, RESET, TEST");

  // Initial State: Dim BLUE to show board is alive and waiting
  setRgbColor(0, 0, 40);
  currentState = STATE_IDLE;
}

void loop() {
  // Listen for commands coming over USB Serial from browser
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd.equalsIgnoreCase("SCAN")) {
      triggerScan();
    } else if (cmd.equalsIgnoreCase("OFF")) {
      triggerOff();
    } else if (cmd.equalsIgnoreCase("RESET")) {
      triggerReset();
    } else if (cmd.equalsIgnoreCase("TEST")) {
      triggerTest();
    }
  }

  // 10-Second Fast-Blinking RED Sequence
  if (currentState == STATE_SCANNING) {
    unsigned long now = millis();

    if (now - scanStartTime >= SCAN_DURATION_MS) {
      currentState = STATE_COMPLETED;
      setRgbColor(0, 255, 0); // Solid GREEN
      Serial.println("[ESP32] 10s complete -> Solid GREEN");
    } else {
      // Toggle every 120ms
      if (now - lastBlinkTime >= 120) {
        lastBlinkTime = now;
        blinkToggle = !blinkToggle;
        if (blinkToggle) {
          setRgbColor(255, 0, 0); // RED ON
        } else {
          setRgbColor(0, 0, 0);   // RED OFF
        }
      }
    }
  }
}
