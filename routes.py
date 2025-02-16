from flask import Blueprint,request, jsonify
from qr_scan import scan_qr  # Import scan_qr function
import psycopg2
from pyfirmata import Arduino, SERVO
from time import sleep

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
        cursor.execute("SELECT id, name, quantity FROM medicines WHERE prescribed='TRUE';")
        records = cursor.fetchall()
        medicines = [{"id": row[0], "name": row[1], "quantity": row[2]} for row in records]
        return jsonify({"status": "success", "data": medicines})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
    finally:
        cursor.close()
        conn.close()

def rotateservo(med_id, qty):
    port = 'COM11'
    servo_pins = {3: 3, 4: 4, 5: 5} 
    board = Arduino(port)

    if board:
        print("Successfully connected to Arduino")

    board.digital[3].mode = SERVO
    board.digital[4].mode = SERVO
    board.digital[5].mode = SERVO    
    if med_id not in servo_pins:
        print(f"Error: No servo assigned for Medicine ID {med_id}")
        return  # Skip if no valid servo
    print("control at rotateservo")
    board.digital[med_id].write(180)  # Start rotation
    sleep(2.5 * qty)  # Rotate based on quantity
    board.digital[med_id].write(90)  # Stop rotation


def dispense_medicine(medicine_list):

    print("Dispensing Medicines...")
    for medicine in medicine_list:
        print(f"Dispensing {medicine['cartQuantity']} units of Medicine ID {medicine['id']}")
        rotateservo(medicine['id'],medicine['cartQuantity'])
    print("Dispensing Complete!")


@routes_bp.route('/update_medicine_stock', methods=['POST'])
def update_medicine_stock():
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "Database connection failed"})

    cursor = conn.cursor()
    try:
        data = request.json.get("cart", [])  # List of medicines in cart
        dispense_medicine(data)  # Call dummy dispense function with cart data

        for item in data:
            cursor.execute(
                "UPDATE medicines SET quantity = quantity - %s WHERE id = %s AND quantity >= %s",
                (item["cartQuantity"], item["id"], item["cartQuantity"])
            )
        conn.commit()

        return jsonify({"status": "success", "message": "Stock updated and medicines dispensed successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)})
    finally:
        cursor.close()
        conn.close()
