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

    await epd.sleep();
    console.log("Display sleeping");
  } catch (error) {
    console.error("Command failed:", error);
  } finally {
    epd.destroy();
  }
}

main();
