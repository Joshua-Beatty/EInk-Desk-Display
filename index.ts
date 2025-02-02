import { Gpio } from 'onoff';
import spi from 'spi-device';
import { Jimp }  from 'jimp';

// epdconfig.ts
class EPDConfig {
    readonly RST_PIN = 17;
    readonly DC_PIN = 25;
    readonly CS_PIN = 8;
    readonly BUSY_PIN = 24;
    readonly PWR_PIN = 18;

    private spiDevice: spi.SpiDevice;
    private gpioRst: Gpio;
    private gpioDc: Gpio;
    private gpioPwr: Gpio;
    private gpioBusy: Gpio;

    constructor() {
        // Initialize GPIO
        this.gpioRst = new Gpio(this.RST_PIN, 'out');
        this.gpioDc = new Gpio(this.DC_PIN, 'out');
        this.gpioPwr = new Gpio(this.PWR_PIN, 'out');
        this.gpioBusy = new Gpio(this.BUSY_PIN, 'in');

        // Initialize SPI
        this.spiDevice = spi.openSync(0, 0);
        this.configureSPI();
    }

    private configureSPI() {
        this.spiDevice.setOptionsSync({
            mode: 0,
            maxSpeedHz: 4000000
        });
    }

    digitalWrite(pin: number, value: number): void {
        switch(pin) {
            case this.RST_PIN:
                this.gpioRst.writeSync(value as any);
                break;
            case this.DC_PIN:
                this.gpioDc.writeSync(value as any);
                break;
            case this.PWR_PIN:
                this.gpioPwr.writeSync(value as any);
                break;
        }
    }

    digitalRead(pin: number): number {
        if(pin === this.BUSY_PIN) {
            return this.gpioBusy.readSync();
        }
        return 0;
    }

    delayMs(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    spiWrite(data: Buffer): Promise<void> {
        return new Promise((resolve, reject) => {
            this.spiDevice.transfer([{
                byteLength: data.length,
                sendBuffer: data,
                receiveBuffer: Buffer.alloc(data.length),
                speedHz: 4000000
            }], (err) => {
                if(err) reject(err);
                else resolve();
            });
        });
    }

    async moduleExit(): Promise<void> {
        this.spiDevice.closeSync();
        this.gpioRst.unexport();
        this.gpioDc.unexport();
        this.gpioPwr.unexport();
        this.gpioBusy.unexport();
    }
}

// epd7in5_V2.ts
const EPD_WIDTH = 800;
const EPD_HEIGHT = 480;

class EPD {
    private config: EPDConfig;
    private width: number;
    private height: number;

    constructor() {
        this.config = new EPDConfig();
        this.width = EPD_WIDTH;
        this.height = EPD_HEIGHT;
    }

    private async sendCommand(command: number): Promise<void> {
        this.config.digitalWrite(this.config.DC_PIN, 0);
        await this.config.spiWrite(Buffer.from([command]));
    }

    private async sendData(data: Buffer): Promise<void> {
        this.config.digitalWrite(this.config.DC_PIN, 1);
        await this.config.spiWrite(data);
    }

    private async readBusy(): Promise<void> {
        await this.sendCommand(0x71);
        while(this.config.digitalRead(this.config.BUSY_PIN) === 0) {
            await this.config.delayMs(20);
        }
    }

    async reset(): Promise<void> {
        this.config.digitalWrite(this.config.RST_PIN, 1);
        await this.config.delayMs(20);
        this.config.digitalWrite(this.config.RST_PIN, 0);
        await this.config.delayMs(2);
        this.config.digitalWrite(this.config.RST_PIN, 1);
        await this.config.delayMs(20);
    }

    async init(): Promise<void> {
        await this.reset();
        
        await this.sendCommand(0x06);
        await this.sendData(Buffer.from([0x17, 0x17, 0x28, 0x17]));
        
        await this.sendCommand(0x01);
        await this.sendData(Buffer.from([0x07, 0x07, 0x28, 0x17]));
        
        await this.sendCommand(0x04);
        await this.config.delayMs(100);
        await this.readBusy();

        await this.sendCommand(0x00);
        await this.sendData(Buffer.from([0x1F]));

        await this.sendCommand(0x61);
        await this.sendData(Buffer.from([0x03, 0x20, 0x01, 0xE0]));

        await this.sendCommand(0x50);
        await this.sendData(Buffer.from([0x10, 0x07]));

        await this.sendCommand(0x60);
        await this.sendData(Buffer.from([0x22]));
    }

    async clear(): Promise<void> {
        const buf = Buffer.alloc(EPD_WIDTH * EPD_HEIGHT / 8).fill(0xFF);
        await this.sendCommand(0x10);
        await this.sendData(buf);
        await this.sendCommand(0x13);
        await this.sendData(Buffer.alloc(EPD_WIDTH * EPD_HEIGHT / 8).fill(0x00));
        await this.sendCommand(0x12);
        await this.config.delayMs(100);
        await this.readBusy();
    }

    async display(imageBuffer: Buffer): Promise<void> {
        await this.sendCommand(0x10);
        await this.sendData(Buffer.from(imageBuffer.map(b => ~b)));
        await this.sendCommand(0x13);
        await this.sendData(imageBuffer);
        await this.sendCommand(0x12);
        await this.config.delayMs(100);
        await this.readBusy();
    }

    async sleep(): Promise<void> {
        await this.sendCommand(0x50);
        await this.sendData(Buffer.from([0xF7]));
        await this.sendCommand(0x02);
        await this.readBusy();
        await this.sendCommand(0x07);
        await this.sendData(Buffer.from([0xA5]));
        await this.config.delayMs(2000);
        await this.config.moduleExit();
    }

    async getBuffer(imagePath: string): Promise<Buffer> {
        const image = await Jimp.read(imagePath);
        image.greyscale().resize({w: this.width, h: this.height});
        
        const buffer = Buffer.alloc(this.width * this.height / 8);
        let byteIndex = 0;
        let bitIndex = 0;

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            const color = image.bitmap.data[idx] < 128 ? 0 : 1;
            buffer[byteIndex] |= (color << (7 - bitIndex));
            
            if(++bitIndex === 8) {
                bitIndex = 0;
                byteIndex++;
            }
        });

        return buffer;
    }
}

// main.ts
async function main() {
    const epd = new EPD();
    
    try {
        console.log("Initializing...");
        await epd.init();
        console.log("Clearing...");
        await epd.clear();

        console.log("Drawing image...");
        const imageBuffer = await epd.getBuffer("test1.png");
        await epd.display(imageBuffer);
        console.log("Image displayed");

        // Add partial update logic here if needed

        console.log("Sleeping...");
        await epd.sleep();
    } catch(err) {
        console.error("Error:", err);
        await epd.sleep();
    }
}

main();