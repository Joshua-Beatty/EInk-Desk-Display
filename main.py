from epd7in5_V2 import EPD
from PIL import Image, ImageOps, ImageDraw, ImageFont
import time

epd = EPD()

print("init ")
epd.init()
print("clear")
epd.Clear()


print("Drawing image")
with Image.open("test1.png") as Himage:
    Himage = Himage.convert("1")
    Himage = ImageOps.invert(Himage)
    buffer = Himage.tobytes() 
    epd.display(buffer)
    print("5.show time")
    epd.init_part()
    draw = ImageDraw.Draw(Himage)
    num = 0
    while (True):
        draw.rectangle((31, 150, 130, 170), fill = 255)
        draw.text((31, 150), time.strftime('%H:%M:%S'), fill = 0)
        epd.display_Partial(epd.getbuffer(Himage),0, 0, epd.width, epd.height)
        num = num + 1
        if(num == 10):
            break

print("Image Drawn")
time.sleep(2)
epd.sleep()