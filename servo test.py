from pyfirmata import Arduino, SERVO, util
from time import sleep

port = 'COM9'
pin3 = 3
pin4 = 4
pin5 = 5
board = Arduino(port)
if board:
    print("Successfully connected to Arduino")

# Set the mode of the pin to SERVO
board.digital[pin3].mode = SERVO
board.digital[pin4].mode = SERVO
board.digital[pin5].mode = SERVO
board.digital[pin3].write(90)
board.digital[pin4].write(90)
board.digital[pin5].write(90)

board.digital[pin3].write(180)  # Rotate at full speed (change value based on your servo)
sleep(2.2)
board.digital[pin3].write(90)   # Stop the servo
sleep(1)

board.digital[pin4].write(180)  # Rotate at full speed (change value based on your servo)
sleep(2.2)
board.digital[pin4].write(90)   # Stop the servo
sleep(1)

board.digital[pin5].write(180)  # Rotate at full speed (change value based on your servo)
sleep(2.2)
board.digital[pin5].write(90)   # Stop the servo
sleep(2)

board.exit()  # Close the connection when done
