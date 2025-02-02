import { spawn, ChildProcess } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

// Command types
interface ClearCommand {
  command: 'clear';
}

interface DrawCommand {
  command: 'draw';
  image: string;
}

interface DrawPartialCommand {
  command: 'draw_partial';
  image: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

type EPDCommand = ClearCommand | DrawCommand | DrawPartialCommand;

// Response types
interface SuccessResponse {
  id: string;
  status: 'success';
  command: string;
}

interface ErrorResponse {
  id: string;
  status: 'error';
  message: string;
}

type EPDResponse = SuccessResponse | ErrorResponse;

type PendingPromise = {
  resolve: (value: EPDResponse) => void;
  reject: (reason?: ErrorResponse) => void;
};

class EPDController {
  private process: ChildProcess;
  private pending: Map<string, PendingPromise>;

  constructor() {
    this.process = spawn('python3', ['epd_handler.py']);
    this.pending = new Map();

    this.process.stdout?.on('data', (data: Buffer) => {
      const responses = data.toString().trim().split('\n');
      responses.forEach((response) => {
        try {
          const parsed: EPDResponse = JSON.parse(response);
          if (parsed.id && this.pending.has(parsed.id)) {
            const { resolve, reject } = this.pending.get(parsed.id)!;
            this.pending.delete(parsed.id);
            parsed.status === 'success' ? resolve(parsed) : reject(parsed);
          }
        } catch (e) {
          console.error('Failed to parse response:', response);
        }
      });
    });

    this.process.stderr?.on('data', (data: Buffer) => {
      console.error('EPD Error:', data.toString());
    });
  }

  public async sendCommand<C extends EPDCommand>(command: C): Promise<EPDResponse> {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const payload = { ...command, id } as C & { id: string };

      this.pending.set(id, { resolve, reject });
      this.process.stdin?.write(JSON.stringify(payload) + '\n');
    });
  }

  public destroy(): void {
    this.process.kill();
    this.pending.clear();
  }
}

// Usage example
async function main() {
  const epd = new EPDController();
  
  try {
    // Clear command
    await epd.sendCommand({ command: 'clear' });
    console.log("JS CLEARED")
    
    // Draw full image
    await epd.sendCommand({
      command: 'draw',
      image: './test1.png'
    });
    console.log("JS DREW")
    
    // Partial update
    await epd.sendCommand({
      command: 'draw_partial',
      image: './test2.png',
      x: 0,
      y: 0,
      width: 800,
      height: 480
    });
    console.log("JS DREW PARTIAL")
    
  } catch (error) {
    console.error('Command failed:', error);
  } finally {
    epd.destroy();
  }
}

main();