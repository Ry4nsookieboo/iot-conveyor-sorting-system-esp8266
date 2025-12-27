# Conveyor Monitor — ESP8266 Based Orange Fruit Weight Monitoring & Sorting System

Proyek IoT untuk memantau berat buah jeruk secara real-time, mengontrol motor conveyor, serta mengekspor riwayat pemantauan ke CSV. Setelah ekspor, data otomatis di-reset agar perhitungan di web dimulai kembali dari nol.

## Arsitektur
- Frontend: React + TypeScript + Vite (`conveyor-monitor/`)
- Backend: Express + Firebase Admin SDK (REST RTDB) (`backend/`)
- Firmware: ESP8266 (HTTP REST ke Firebase RTDB) (`conveyor-monitor/firmware/esp8266-conveyor.ino`)

## Fitur Utama
- Pemantauan berat terakhir dan grafik historis secara real-time
- Pengaturan ambang batas berat dan template nilai
- Kontrol motor conveyor (ON/OFF)
- Ekspor CSV dari `conveyor/history` dan reset otomatis data setelah unduhan selesai

## Struktur Direktori
```
conveyor-monitor/
├─ backend/
│  ├─ server.js
│  └─ package.json
├─ conveyor-monitor/
│  ├─ src/ (komponen React, grafik, kontrol, dsb.)
│  ├─ package.json
│  ├─ index.html
│  ├─ tsconfig*.json
│  └─ firmware/
│     └─ esp8266-conveyor.ino
└─ README.md
```

## Prasyarat
- Node.js 18+
- npm 9+
- Arduino IDE (untuk firmware ESP8266)

## Menjalankan Frontend
```
cd conveyor-monitor/conveyor-monitor
npm install
npm run dev
```
Frontend berjalan di `http://localhost:5173` (default Vite). Aplikasi akan membuka endpoint ekspor pada backend di `http://localhost:5000/api/export`.

## Menjalankan Backend
```
cd backend
npm install
node server.js
```
Backend berjalan di `http://localhost:5000`. Endpoint ekspor tersedia di `GET /api/export`.

Catatan: `server.js` menggunakan ESM `import`. Jika Node Anda tidak mendukung ESM untuk `.js`, tambahkan `\"type\": \"module\"` pada `backend/package.json` atau jalankan dengan Node versi terbaru.

## Konfigurasi Firebase
Saat ini konfigurasi Firebase RTDB di-hardcode pada:
- Frontend: `conveyor-monitor/src/firebaseConfig.tsx`
- Backend: `backend/server.js`
- Firmware: `firmware/esp8266-conveyor.ino`

Untuk produksi, disarankan memindahkan kredensial ke variabel lingkungan dan tidak meng-commit rahasia.

## Alur Data RTDB
- `conveyor/beratTerakhir`: berat terbaru (number)
- `conveyor/statusMotor`: status motor (`"ON"` / `"OFF"`)
- `settings/batasBerat`: ambang batas kategori (number)
- `settings/aplikasiAktif`: apakah sistem aktif (boolean)
- `conveyor/history`: daftar entri
  - `berat`: nilai berat (number)
  - `kategori`: `"A"` atau `"B"` (opsional, fallback via ambang batas)
  - `tanggal`: ISO time string

## Ekspor CSV & Reset Otomatis
- Endpoint: `GET /api/export`
- Mengunduh CSV dari isi `conveyor/history`
- Setelah pengiriman respons selesai, backend:
  - Menghapus `conveyor/history`
  - Menyetel `conveyor/beratTerakhir = 0`

Efek di frontend: daftar buah, statistik, dan grafik akan kembali kosong dan perhitungan dimulai dari nol.

## Firmware (ESP8266)
- Atur `WIFI_SSID`, `WIFI_PASSWORD`, dan `DB_URL` sesuai RTDB Anda
- Firmware mengirim data ke RTDB menggunakan HTTP REST (`GET/PUT/POST`)
- Siklus: buka gate, timbang, kirim ke RTDB, dorong, jalan, sortir berdasarkan ambang batas

## Skrip Tersedia
- Frontend:
  - `npm run dev`: jalankan pengembangan
  - `npm run build`: build produksi
  - `npm run preview`: pratinjau build
- Backend: jalankan `node server.js`

## Troubleshooting
- CORS: Backend sudah mengaktifkan `cors()`. Pastikan frontend memanggil `http://localhost:5000`.
- Ekspor tidak mereset: pastikan backend berjalan dan endpoint yang diakses adalah `GET /api/export`.
- ESM error di backend: tambahkan `\"type\": \"module\"` di `backend/package.json` atau gunakan Node versi terbaru.

## Lisensi
Gunakan sesuai kebutuhan akademik/riset. Perhatikan kebijakan penggunaan kredensial Firebase dan keamanan data.

---

# English Version — Conveyor Monitor

IoT project to monitor citrus weight in real time, control the conveyor motor, and export monitoring history to CSV. After export finishes, data is automatically reset so the web app recalculates from zero.

## Architecture
- Frontend: React + TypeScript + Vite (`conveyor-monitor/`)
- Backend: Express + Firebase (RTDB REST) (`backend/`)
- Firmware: ESP8266 (HTTP REST to Firebase RTDB) (`conveyor-monitor/firmware/esp8266-conveyor.ino`)

## Key Features
- Real-time last weight and historical chart
- Weight threshold settings and template values
- Conveyor motor control (ON/OFF)
- Export CSV from `conveyor/history` with automatic reset after download

## Directory Structure
```
conveyor-monitor/
├─ backend/
│  ├─ server.js
│  └─ package.json
├─ conveyor-monitor/
│  ├─ src/ (React components, charts, controls, etc.)
│  ├─ package.json
│  ├─ index.html
│  ├─ tsconfig*.json
│  └─ firmware/
│     └─ esp8266-conveyor.ino
└─ README.md
```

## Prerequisites
- Node.js 18+
- npm 9+
- Arduino IDE (for ESP8266 firmware)

## Run Frontend
```
cd conveyor-monitor/conveyor-monitor
npm install
npm run dev
```
The frontend runs at `http://localhost:5173` (Vite default). The app triggers the export endpoint on the backend at `http://localhost:5000/api/export`.

## Run Backend
```
cd backend
npm install
node server.js
```
The backend runs at `http://localhost:5000`. Export endpoint: `GET /api/export`.

Note: `server.js` uses ESM `import`. If your Node does not support ESM with `.js`, add `"type": "module"` to `backend/package.json` or use a recent Node version.

## Firebase Configuration
Currently the Firebase RTDB config is hardcoded at:
- Frontend: `conveyor-monitor/src/firebaseConfig.tsx`
- Backend: `backend/server.js`
- Firmware: `firmware/esp8266-conveyor.ino`

For production, move credentials to environment variables and avoid committing secrets.

## RTDB Data Flow
- `conveyor/beratTerakhir`: last weight (number)
- `conveyor/statusMotor`: motor status (`"ON"` / `"OFF"`)
- `settings/batasBerat`: weight threshold (number)
- `settings/aplikasiAktif`: whether system is active (boolean)
- `conveyor/history`: list entries
  - `berat`: weight (number)
  - `kategori`: `"A"` or `"B"` (optional, fallback via threshold)
  - `tanggal`: ISO time string

## CSV Export & Auto Reset
- Endpoint: `GET /api/export`
- Downloads CSV from `conveyor/history`
- After the response finishes sending, the backend:
  - Removes `conveyor/history`
  - Sets `conveyor/beratTerakhir = 0`

Frontend effect: orange list, stats, and charts reset to empty and calculations restart from zero.

## Firmware (ESP8266)
- Set `WIFI_SSID`, `WIFI_PASSWORD`, and `DB_URL` for your RTDB
- Firmware talks to RTDB via HTTP REST (`GET/PUT/POST`)
- Cycle: open gate, weigh, send to RTDB, push, move, sort using threshold

## Available Scripts
- Frontend:
  - `npm run dev`: development server
  - `npm run build`: production build
  - `npm run preview`: preview build
- Backend: run `node server.js`

## Troubleshooting
- CORS: Backend enables `cors()`. Ensure frontend calls `http://localhost:5000`.
- Export not resetting: ensure backend is running and you call `GET /api/export`.
- Backend ESM error: add `"type": "module"` to `backend/package.json` or use a modern Node version.

## License
Use for academic/research purposes. Mind Firebase credentials usage and data security best practices.
