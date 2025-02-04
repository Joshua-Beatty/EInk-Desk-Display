
import puppeteerMain from "puppeteer";
import puppeteerCore, { PuppeteerNode } from "puppeteer-core";
import getHtml from "./ui/Render";
import fs from "fs";

let puppeteer: PuppeteerNode;
if (process.platform.includes("win")) {
  puppeteer = puppeteerMain as any;
} else {
  puppeteer = puppeteerCore;
}
async function takeScreenshot(outputPath: string) {
    const html = await getHtml();
    console.log(1)
  const browser = await puppeteer.launch(
    process.platform.includes("win")
      ? {}
      : { executablePath: "/usr/bin/chromium-browser" }
  );
  console.log(2)
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 480 });
  console.log(3)
  console.log(4)
  console.log(html)
  await page.setContent(html);
  console.log(5)
  const screenshot = await page.screenshot({});
  fs.writeFileSync(outputPath, screenshot);
  fs.writeFileSync("./output/index.html", html);
  browser.close();
}

export default takeScreenshot