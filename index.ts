
import { Jimp }  from 'jimp';
import EPD from './epdDriver';

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