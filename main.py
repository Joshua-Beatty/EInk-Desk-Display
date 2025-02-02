from epd7in5_V2 import EPD
from PIL import Image, ImageOps
import time

epd = EPD()

print("init ")
epd.init()
print("clear")
epd.Clear()


print("Drawing image")
with Image.open("test.png") as img:
    img = img.convert("1")
    img = ImageOps.invert(img)
    buffer = img.tobytes() 
    epd.display(buffer)


print("Image Drawn")
time.sleep(2)
epd.sleep()