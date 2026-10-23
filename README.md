# Express Care 🏥
> **Autonomous Pre-Consultation Biometric Screening & Dynamic Queue Prioritization System**

Express Care is an IoT-enabled clinical triage kiosk that integrates physical bio-sensors (MAX30102 for SpO2/Pulse and MLX90614 for infrared body temperature) with a local medical AI (Llama 3.1 via Ollama) and a real-time living queue management system.

---

## ⚡ Features

- **Patient Self-Check-in:** Captures patient demographics (Name, Age, Gender).
- **Physical Biometric Scanning:** 10-second touchless sensor scan with live dynamic countdown and hardware visual feedback via ESP32-S3 onboard RGB LED.
- **Adaptive 5-Question AI Intake:** Local LLM conducts pre-consultation History of Present Illness (HPI) interviews without cloud dependency or medical hallucinations.
- **Living Queue Engine:** Dynamically re-ranks patient queue by priority score (1–10) and arrival time via Supabase Realtime WebSockets.
- **Doctor Consultation Portal:** Single-token desk view with prominent patient identification, 3-point vitals strip, and concise pointwise clinical assessment points.
- **Privacy-Preserved Public Display:** Displays queue token numbers and estimated wait times on waiting room monitors without exposing sensitive triage scores.
- **Hardware Link:** Direct Web Serial API integration over USB cable (Chrome / Edge) for sub-millisecond, zero-drop hardware control.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Database & Sync:** Supabase (PostgreSQL 15, Row Level Security, Realtime WebSockets)
- **Edge AI:** Ollama running quantized `Llama 3.1 (8B)` locally
- **Hardware / Microcontroller:** ESP32-S3 (Tensilica Xtensa Dual-Core) + Addressable WS2812 RGB LED + MAX30102 / MLX90614 sensors

---

## 🚀 Quick Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/debdattamandalin/expresscare.git
cd expresscare
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Supabase project credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Setup Local AI (Ollama)
Install Ollama from [ollama.com](https://ollama.com). Then pull the Llama 3.1 model:
```bash
ollama pull llama3.1
```
Start Ollama with cross-origin access enabled for your local Vite server:
```bash
OLLAMA_ORIGINS="*" ollama serve
```

### 5. Flash ESP32-S3 Firmware
1. Open [`esp32/esp32_kiosk_firmware.ino`](./esp32/esp32_kiosk_firmware.ino) in the Arduino IDE.
2. Select your board (e.g., **ESP32S3 Dev Module**).
3. Click **Upload** to flash the board at 115200 baud.
4. Close the Serial Monitor in Arduino IDE so the browser can claim the USB port.

### 6. Run the Web Application
```bash
npm run dev
```
Open **`http://localhost:5173`** in Google Chrome or Microsoft Edge.

---

## 📋 Portals & Access

| Portal | URL Route | Description | Credentials (Demo) |
| :--- | :--- | :--- | :--- |
| **Patient Kiosk** | `/patient` | Intake, vitals scanning, and 5-turn AI interview | Public |
| **Public Token Display** | `/token` | Waiting room screen displaying living queue | Public |
| **Doctor Portal** | `/doctor` | Physician priority desk & pointwise assessment | Staff ID: `doc1`<br>Password: `12345678` |
| **Admin Operations** | `/admin` | Clinic load, average wait time, and analytics | Public / Demo |
| **Hardware Diagnostics** | `/hardware` | Web Serial pairing and manual LED test controls | Internal |

---

## 🔌 Hardware Pinouts (ESP32-S3)

| Sensor Pin | ESP32-S3 Pin | Function |
| :--- | :--- | :--- |
| **MAX30102 / MLX90614 VIN** | **3V3** | 3.3V Power |
| **MAX30102 / MLX90614 GND** | **GND** | Ground |
| **MAX30102 / MLX90614 SDA** | **GPIO 8** | I2C Data |
| **MAX30102 / MLX90614 SCL** | **GPIO 9** | I2C Clock |
| **Onboard RGB LED (WS2812)** | **GPIO 48** | Status indicator (Idle Blue, Scan Red, Green Complete) |

---

## 📄 License
This project is licensed under the MIT License.
