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

  const browser = await puppeteer.launch(
    process.platform.includes("win")
      ? {}
      : { executablePath: "/usr/bin/chromium-browser" }
  );

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 480 });

  const html = await getHtml();
  await page.setContent(html);
  const screenshot = await page.screenshot({});
  fs.writeFileSync(outputPath, screenshot);
  fs.writeFileSync("./output/index.html", html);
  browser.close();
}

export default takeScreenshot;
