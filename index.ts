const { devices, init } = require('epaperjs');
import fs from "fs"

const waveshare7in5v2: {init: ()=> void, displayPNG: (imgContents: any, dither: boolean) => Promise<void>} = devices.waveshare7in5v2



async function main(){
    let fileData = fs.readFileSync("test.png");
    waveshare7in5v2.init()
    await waveshare7in5v2.displayPNG(fileData, false)
}

main();