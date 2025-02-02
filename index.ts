import sharp from "sharp";
import EPDController from "./epdController";

async function main() {
  const epd = new EPDController();

  try {
    // Execute commands sequentially with proper typing
    await epd.clear();
    console.log("Display cleared");

    await epd.draw("./test1.png");
    console.log("Full image drawn");

    await epd.drawPartial("./test2.png", 0, 0, 800, 480);
    console.log("Partial update completed");

    const image = sharp("./test2.png");

    await image
      .composite([
        {
            
          input: {
            
            text: {
              text: `<span foreground="black" background="white">${new Date().toLocaleString().split(", ")[1]}</span>`,
              width: 450,
              height: 150,
            },
          },
          top: 480 - 150,
          left: 800 - 450,
        },
      ])
      .toFile("./test.png");
    await epd.drawPartial("./test.png", 0, 0, 800, 480);
    console.log("Partial update completed");

    await epd.sleep();
    console.log("Display sleeping");
  } catch (error) {
    console.error("Command failed:", error);
  } finally {
    epd.destroy();
  }
}

main();
