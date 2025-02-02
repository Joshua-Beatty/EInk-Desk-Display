from epd7in5_V2 import EPD
from PIL import Image, ImageOps, ImageDraw, ImageFont
import time

epd = EPD()

print("init ")
epd.init()
print("clear")
epd.Clear()


print("Drawing image")
# Load and invert the initial image
with Image.open("7in5_V2.bmp") as Himage:
    # Himage = Himage.convert("L")  # Convert to grayscale (needed for inversion)
    # Himage = ImageOps.invert(Himage)  # Invert only once
    # Himage = Himage.convert("1")  # Convert back to 1-bit black & white
    pass

buffer = Himage.tobytes()  # Convert to raw bytes
epd.display(buffer)  # Show the corrected initial image

print("Initial image displayed")

# Prepare for partial updates
epd.init_part()
draw = ImageDraw.Draw(Himage)

num = 0
while num < 10:
    draw.rectangle((31, 150, 130, 170), fill=0)  # Erase old time
    draw.text((31, 150), time.strftime('%H:%M:%S'), fill=255)  # Draw new time

    epd.display_Partial(epd.getbuffer(Himage), 0, 0, epd.width, epd.height)  # Update part of the screen

    time.sleep(1)  # Wait before updating again
    num += 1

print("Finished updating time")

print("Image Drawn")
time.sleep(2)
epd.sleep()