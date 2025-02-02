import sys
import json
from epd7in5_V2 import EPD
from PIL import Image

epd = EPD()

def handle_command(command):
    response = {"id": command.get('id')}
    try:
        cmd = command.get('command')
        
        if cmd == 'clear':
            epd.init()
            epd.Clear()
            response.update({"status": "success", "command": cmd})
        
        elif cmd == 'draw':
            img_path = command.get('image')
            img = Image.open(img_path).convert('1')
            epd.init()
            epd.display(epd.getbuffer(img))
            response.update({"status": "success", "command": cmd})
        
        elif cmd == 'draw_partial':
            img_path = command.get('image')
            x = command.get('x', 0)
            y = command.get('y', 0)
            width = command.get('width', epd.width)
            height = command.get('height', epd.height)
            
            img = Image.open(img_path).convert('1')
            epd.init_part()
            epd.display_Partial(epd.getbuffer(img), x, y, width, height)
            response.update({"status": "success", "command": cmd})
        
        elif cmd == 'sleep':
            epd.sleep()
            response.update({"status": "success", "command": cmd})
        
        else:
            raise ValueError(f"Unknown command: {cmd}")
    
    except Exception as e:
        response.update({"status": "error", "message": str(e)})
    
    print(json.dumps(response))
    sys.stdout.flush()

def main():
    print("EPD handler ready", flush=True)
    for line in sys.stdin:
        try:
            command = json.loads(line.strip())
            handle_command(command)
        except json.JSONDecodeError:
            error_response = json.dumps({
                "status": "error",
                "message": "Invalid JSON",
                "id": None
            })
            print(error_response)
            sys.stdout.flush()

if __name__ == '__main__':
    try:
        main()
    finally:
        pass