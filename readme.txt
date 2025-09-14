# QR-Based Medicine Dispenser

This project is a **QR-based medicine dispensing system** that automates medicine retrieval using a **Flask backend, PostgreSQL database, QR scanning, and Arduino-controlled servos** for dispensing. The system ensures **accurate and efficient medicine distribution** with a web-based UI.

Features

QR Code Scanning**: Extracts medicine details from QR codes.

-Flask API Backend**: Handles QR processing, database interactions, and dispensing requests.
-PostgreSQL Database (Neon on Azure)**: Stores and updates medicine inventory.
-JavaScript Frontend (index.html & script.js)**: User interface for scanning, cart management, and checkout.
-Arduino Servo Control**: Dispenses medicine via continuous rotation servos.
-GitHub & Render Deployment**: Private repository with live hosting.

Tech Stack

- Backend**: Flask, Python
- Database**: PostgreSQL (Neon DB on Azure)
- Frontend**: HTML, TailwindCSS, JavaScript
- QR Processing**: OpenCV (`cv2`)
- Hardware Control**: Arduino (`pyFirmata`)

## 📂 Project Structure
```
/your-project-folder
│── database.py         # PostgreSQL connection & queries
│── newapp.py           # Main Flask app entry
│── qr_scan.py          # QR scanning using OpenCV
│── routes.py           # API routes for scanning & dispensing
│── hardware.py         # Arduino servo control functions
│── templates/
│   ├── index.html      # Frontend UI
│── static/
│   ├── script.js       # JS for frontend interactions
│── requirements.txt    # Python dependencies
│── Dockerfile          # Deployment setup for Render
│── README.md           # Project documentation
```

Installation & Setup
Install Dependencies
pip install -r requirements.txt

Setup Database
- Use **Neon (Azure-hosted PostgreSQL)** and update `DATABASE_URL` in `.env`.
- Run schema setup in `database.py`.

Run Flask Server
```bash
python newapp.py
```
Flask API will start at `http://127.0.0.1:5000`

Usage
1. **Scan a QR Code** (via frontend or `/scan_qr` API).
2. **Add medicines to cart** (manually or via QR data).
3. **Click Proceed to Pay** → Updates database & dispenses medicine.
4. **Servos dispense the correct quantity** based on the selected medicine.

Arduino Setup
- Connect servos to Arduino **(pins 3, 4, 5)**.
- Upload **StandardFirmata** to Arduino using the **Arduino IDE**.
- Connect via **pyFirmata** in `servo_control.py`.

API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/scan_qr` | `GET` | Scans a QR code & returns medicine details |
| `/get_medicines` | `GET` | Fetches available medicines from DB |
| `/update_medicine_stock` | `POST` | Updates stock & dispenses medicines |

License
This project is **private** and not publicly shared.

Maintainer: Om Sanjay Bahirat
Contact: ombahirat04@gmail.com  
Developed for Secure Medicine Dispensing


