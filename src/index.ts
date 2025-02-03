import sharp from "sharp";
import EPDController from "./epdController";
import fs from "fs";

async function drawTime(epd: EPDController) {
  const image = sharp("./test2.png");

  const time = new Date()
    .toLocaleString("en-US", { timeZone: "America/Denver" })
    .split(", ")[1];
  await image
    .composite([
      {
        input: Buffer.from(
          `<svg>
                <rect x="0" y="0" width="450" height="150" fill="#fff" />
                <text x="430" y="130" text-anchor="end" font-size="74" fill="#000">${time}</text>
            </svg>`
        ),
        top: 480 - 150,
        left: 800 - 450,
        gravity: "southeast",
      },
    ])
    .toFile("./output/test.png");
  await epd.drawPartial("./output/test.png", 0, 0, 800, 480);
  console.log("Partial update completed");
}
async function main() {
  const epd = new EPDController();
  try {
    fs.mkdirSync("./output");
  } catch (e) {}

  try {
    // Execute commands sequentially with proper typing
    await epd.clear();
    console.log("Display cleared");

    const output = "./output/output.png"
    await takeScreenshot(output);
    await epd.draw(output);
    console.log("Full image drawn");

    for(let i = 0; i < 15; i++){
      await waitUntilNextMinute()
      const output = "./output/output.png"
      await takeScreenshot(output);
      await epd.drawPartial(output, 0,0, 800, 480);
    }

    await epd.sleep();
    console.log("Display sleeping");
  } catch (error) {
    console.error("Command failed:", error);
  } finally {
    epd.destroy();
  }
}

main();
function waitUntilNextMinute() {
  const now = new Date();
  const secondsToWait = 60 - now.getSeconds();
  return new Promise(resolve => setTimeout(resolve, secondsToWait * 1000));
}
function waitUntilNextSecond(): Promise<void> {
  return new Promise((resolve) => {
    const now = new Date();
    const msUntilNextSecond = 1000 - now.getMilliseconds();
    setTimeout(resolve, msUntilNextSecond);
  });
}

let puppeteer
import puppeteerMain from "puppeteer"
import puppeteerCore from "puppeteer-core"
if(process.platform.includes("win")){
  puppeteer = puppeteerMain
} else {
  puppeteer = puppeteerCore
}
import getHtml from "./main";

async function takeScreenshot(outputPath: string) {
  const browser = await puppeteer.launch(process.platform.includes("win") ? {} : {executablePath: '/usr/bin/chromium-browser'});
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 480});
  const html = await getHtml();
  await page.setContent( html);
  const screenshot = await page.screenshot({});
  fs.writeFileSync(outputPath, screenshot);
  fs.writeFileSync("./output/index.html", html);
  browser.close();
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}