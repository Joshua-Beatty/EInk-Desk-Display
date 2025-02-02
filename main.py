from epd7in5_V2 import EPD
import io
import time

epd = EPD()

print("init ")
epd.init()
print("clear")
epd.Clear()


print("Drawing image")
with open("test.png", "rb") as f:
    buffer = io.BytesIO(f.read())
    epd.display(buffer)


print("Image Drawn")
time.sleep(2)
epd.sleep()