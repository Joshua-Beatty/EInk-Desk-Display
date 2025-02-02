from epd7in5_V2 import EPD
import io
import time

epd = EPD()

print("init and Clear")
epd.init()
epd.Clear()


with open("test.png", "rb") as f:
    buffer = io.BytesIO(f.read())
    epd.display(buffer)


time.sleep(2)
epd.sleep()