from flask import Blueprint, jsonify
from qr_scan import scan_qr  # Import scan_qr function
import psycopg2

routes_bp = Blueprint('routes', __name__)

@routes_bp.route('/scan_qr', methods=['GET'])
def scan_qr_api():
    scanned_data = scan_qr()  # Call function
    if scanned_data:
        return jsonify({"status": "success", "data": scanned_data})
    else:
        return jsonify({"status": "error", "message": "No valid QR code detected"})


DATABASE_URL = "postgresql://neondb_owner:npg_i4wZVSft0bQj@ep-rough-brook-a8m1z80v-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print("Database connection error:", e)
        return None

@routes_bp.route('/get_medicines', methods=['GET'])
def get_medicines():
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"})

    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, quantity FROM medicines WHERE prescribed='FALSE';")
        records = cursor.fetchall()
        medicines = [{"id": row[0], "name": row[1], "quantity": row[2]} for row in records]
        return jsonify({"status": "success", "data": medicines})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
    finally:
        cursor.close()
        conn.close()
