import { spawn, ChildProcess } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

interface CommandResponse {
  id: string;
  status: 'success' | 'error';
  command?: string;
  message?: string;
}

type ResponseHandler = {
  resolve: (value: CommandResponse) => void;
  reject: (reason?: CommandResponse) => void;
};

class EPDController {
  private process: ChildProcess;
  private pending = new Map<string, ResponseHandler>();

  constructor() {
    this.process = spawn('python3', ['epd_handler.py']);
    
    this.process.stdout?.on('data', (data: Buffer) => {
      const responses = data.toString().trim().split('\n');
      responses.forEach(response => this.handleResponse(response));
    });

    this.process.stderr?.on('data', (data: Buffer) => {
      console.error('EPD Error:', data.toString());
    });
  }

  private handleResponse(response: string): void {
    try {
      const parsed: CommandResponse = JSON.parse(response);
      if (parsed.id && this.pending.has(parsed.id)) {
        const handler = this.pending.get(parsed.id)!;
        this.pending.delete(parsed.id);
        parsed.status === 'success' ? handler.resolve(parsed) : handler.reject(parsed);
      }
    } catch (e) {
      console.error('Failed to parse response:', response);
    }
  }

  private sendCommand<T extends object>(command: T): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const payload = { ...command, id };
      
      this.pending.set(id, { resolve, reject });
      this.process.stdin?.write(JSON.stringify(payload) + '\n');
    });
  }

  public async clear(): Promise<CommandResponse> {
    return this.sendCommand({ command: 'clear' });
  }

  public async draw(imagePath: string): Promise<CommandResponse> {
    return this.sendCommand({ 
      command: 'draw',
      image: imagePath
    });
  }

  public async drawPartial(
    imagePath: string,
    position: { x: number; y: number },
    dimensions: { width: number; height: number }
  ): Promise<CommandResponse> {
    return this.sendCommand({
      command: 'draw_partial',
      image: imagePath,
      x: position.x,
      y: position.y,
      width: dimensions.width,
      height: dimensions.height
    });
  }

  public async sleep(): Promise<CommandResponse> {
    return this.sendCommand({ command: 'sleep' });
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
    // Execute commands sequentially with proper typing
    await epd.clear();
    console.log('Display cleared');
    
    await epd.draw('./test1.png');
    console.log('Full image drawn');
    
    await epd.drawPartial(
      './test2.png',
      { x: 0, y: 0 },
      { width: 800, height: 480 }
    );
    console.log('Partial update completed');
    
    await epd.sleep();
    console.log('Display sleeping');
  } catch (error) {
    console.error('Command failed:', error);
  } finally {
    epd.destroy();
  }
}

main();