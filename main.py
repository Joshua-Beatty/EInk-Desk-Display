from epd7in5_V2 import EPD
import io
import time
from PIL import Image

epd = EPD()

print("init ")
epd.init()
print("clear")
epd.Clear()


print("Drawing image")
with Image.open("test.png") as img:
    img = img.convert("1")
    buffer = img.tobytes() 
    epd.display(buffer)


print("Image Drawn")
time.sleep(2)
epd.sleep()