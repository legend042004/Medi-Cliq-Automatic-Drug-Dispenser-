import cv2
import json

def scan_qr():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Camera could not be opened!")
    else:
        print("Camera successfully accessed!")# Open the camera
    detector = cv2.QRCodeDetector()

    while True:
        ret, img = cap.read()
        if not ret:
            print("Failed to open camera")
            break

        data, _, _ = detector.detectAndDecode(img)
        if data:
            try:
                qr_data = json.loads(data)  # Convert JSON string to Python dictionary
                print(qr_data)
                return qr_data  # Return the extracted data
            except json.JSONDecodeError:
                print("Invalid QR Code format. Expected JSON.")

        cv2.imshow('QR Scanner', img)
        if cv2.waitKey(1) == ord('q'):  # Press 'q' to exit scanning
            break

    cap.release()
    cv2.destroyAllWindows()
    return None  # Return None if no valid QR code is scanned

if __name__ == "__main__":
    scanned_data = scan_qr()
    if scanned_data:
        print("Patient Name:", scanned_data.get("patient_name"))
        print("Medicine ID:", scanned_data.get("medicine_id"))
        print("Quantity:", scanned_data.get("quantity"))
    else:
        print("No valid QR code detected.")

