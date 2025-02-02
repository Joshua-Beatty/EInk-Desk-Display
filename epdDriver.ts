
import { Jimp } from 'jimp';
import EPDConfig from './epdConfig';
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
        while(this.config.digitalRead(this.config.BUSY_PIN) === 0) {
            await this.sendCommand(0x71);
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
        console.log("reseting")
        await this.reset();
        
        console.log("sendCommand(0x06)")
        await this.sendCommand(0x06);
        console.log("sendData(Buffer.from([0x17, 0x17, 0x28, 0x17])")
        await this.sendData(Buffer.from([0x17, 0x17, 0x28, 0x17]));
        console.log(1)
        
        await this.sendCommand(0x01);
        console.log(2)
        await this.sendData(Buffer.from([0x07, 0x07, 0x28, 0x17]));
        console.log(3)
        
        await this.sendCommand(0x04);
        console.log(4)
        await this.config.delayMs(100);
        console.log(5)
        await this.readBusy();
        console.log(6)

        await this.sendCommand(0x00);
        console.log(7)
        await this.sendData(Buffer.from([0x1F]));
        console.log(8)

        await this.sendCommand(0x61);
        await this.sendData(Buffer.from([0x03, 0x20, 0x01, 0xE0]));
        console.log(9)


        await this.sendCommand(0x50);
        await this.sendData(Buffer.from([0x10, 0x07]));
        console.log(10)


        await this.sendCommand(0x60);
        await this.sendData(Buffer.from([0x22]));
        console.log(11)
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

export default EPD