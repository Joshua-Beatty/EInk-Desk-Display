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

    const time = new Date().toLocaleString().split(", ")[1];
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
          gravity: "southeast"
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
