from pyfirmata import Arduino, SERVO, util
from time import sleep

port = 'COM9'
servo_pins = {3: 3, 4: 4, 5: 5} 

board = Arduino(port)

 
if board:
    print("Successfully connected to Arduino")

board.digital[3].mode = SERVO
board.digital[4].mode = SERVO
board.digital[5].mode = SERVO    


def rotateservo(med_id, qty):
    if med_id not in servo_pins:
        print(f"Error: No servo assigned for Medicine ID {med_id}")
        return  # Skip if no valid servo

    pin = servo_pins[med_id]  # Get corresponding pin
    board.digital[pin].write(180)  # Start rotation
    sleep(2.5 * qty)  # Rotate based on quantity
    board.digital[pin].write(90)  # Stop rotation

    

   
board.digital[3].write(90)
board.digital[4].write(90)
board.digital[5].write(90)
    
    
board.exit()  
