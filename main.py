from epd7in5_V2 import EPD
from PIL import Image, ImageOps, ImageDraw, ImageFont
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

    # partial update
print("4.show time")
epd.init()
epd.display_Base_color(0xFF)
epd.init_part()
Himage = Image.new('1', (epd.width, epd.height), 0)
draw_Himage = ImageDraw.Draw(Himage)
num = 0
while (True):
    draw_Himage.rectangle((31, 150, 130, 170), fill = 0)
    draw_Himage.text((31, 150), time.strftime('%H:%M:%S'), fill = 255)
    epd.display_Partial(epd.getbuffer(Himage),0, 0, epd.width, epd.height)
    num = num + 1
    if(num == 10):
        break


print("Image Drawn")
time.sleep(2)
epd.sleep()