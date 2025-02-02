from epd7in5_V2 import EPD
from PIL import Image, ImageOps, ImageDraw, ImageFont
import time

import signal
import sys


epd = EPD()

def signal_handler(sig, frame):
    epd.epdconfig.module_exit(cleanup=True)
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

print("init ")
epd.init()
print("clear")
epd.Clear()


print("Drawing image")

Himage = Image.open("test1.png")
Himage = Himage.convert("1")
epd.display(epd.getbuffer(Himage))

print("Initial image displayed")

# Prepare for partial updates
epd.init_part()
draw = ImageDraw.Draw(Himage)

Himage = Image.open("test.png")
Himage = Himage.convert("1")
epd.display_Partial(epd.getbuffer(Himage), 0, 0, epd.width, epd.height)

# num = 0
# while num < 10:
#     draw.rectangle((31, 150, 130, 170), fill=255)  # Erase old time
#     draw.text((31, 150), time.strftime('%H:%M:%S'), fill=0)  # Draw new time

#     epd.display_Partial(epd.getbuffer(Himage), 0, 0, epd.width, epd.height)  # Update part of the screen

#     time.sleep(1)  # Wait before updating again
#     num += 1

print("Finished updating time")

print("Image Drawn")
time.sleep(2)
epd.sleep()
