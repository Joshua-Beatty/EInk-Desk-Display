import { Gpio } from "onoff";
import spi from 'spi-device';

class EPDConfig {
    readonly RST_PIN = 17 + 512;
    readonly DC_PIN = 25 + 512;
    readonly CS_PIN = 8 + 512;
    readonly BUSY_PIN = 24 + 512;
    readonly PWR_PIN = 18 + 512;

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
        this.gpioBusy = new Gpio(this.BUSY_PIN, 'in', "both");

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
            const t = this.gpioBusy.readSync()
            console.log(t)
            return t;
        }
        return 0;
    }

    delayMs(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async spiWrite(data: Buffer): Promise<void> {
        const chunkSize = 4096; // Adjust as needed
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await new Promise<void>((resolve, reject) => {
                this.spiDevice.transfer([{
                    byteLength: chunk.length,
                    sendBuffer: chunk,
                    speedHz: 4000000
                }], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
    }

    async moduleExit(): Promise<void> {
        this.spiDevice.closeSync();
        this.gpioRst.unexport();
        this.gpioDc.unexport();
        this.gpioPwr.unexport();
        this.gpioBusy.unexport();
    }
}

export default EPDConfig