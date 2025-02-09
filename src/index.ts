import EPDController from "./epdController";
import fs from "fs";
import "dotenv/config";
import takeScreenshot from "./screenshot";
import { CronJob } from 'cron';

async function main() {
  const epd = new EPDController();
  try {
    fs.mkdirSync("./output");
  } catch (e) {}

  await epd.clear()
  console.log("Drawing initial Frame")
  await updateScreen(epd, false)

  new CronJob(
    '* * * * *', // cronTime
    async function () {
      try {
        const now = new Date()
        //Do a full refresh every 2 hours at minute 0
        const partialRefresh = !(now.getHours() % 2 == 0 && now.getMinutes() == 0)
        await updateScreen(epd, partialRefresh)
      } catch(e){
        console.error(e)
      }
    }, // onTick
    null, // onComplete
    true, // start
    'America/Denver' // timeZone
  );
}

async function updateScreen(epd: EPDController, partial= true) {
  const output = "./output/output.png";
  await takeScreenshot(output);
  if(partial){
    await epd.drawPartial(output, 0, 0, 800, 480);
  } else {
    await epd.draw(output);
  }
  await epd.sleep();
}

main();
