import pyautogui
import time

# Optional: Get current mouse position
current_x, current_y = pyautogui.position()

print("Mouse automation started. Press Ctrl+C to stop.")

try:
    while True:
        # Move the mouse by 1 pixel and back to prevent blocking
        pyautogui.moveTo(current_x + 1, current_y)
        pyautogui.moveTo(current_x, current_y)

        # Or to simulate a click instead:
        # pyautogui.click()

        print(f"Mouse triggered at ({current_x}, {current_y})")
        time.sleep(2)  # wait 2 seconds

except KeyboardInterrupt:
    print("Stopped by user.")
