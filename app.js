const puppeteer = require("puppeteer-core");

const fs = require("fs");

let config = fs.readFileSync("./config.txt", "utf8");
config = config.split("\n");
let timeStartWait = +config.shift().trim();
console.log(`timeStartWait: ${timeStartWait}s`);
let timeWatching = +config.shift().trim();
console.log(`timeWatching: ${timeWatching}h`);
let listVideo = config;
console.log("listVideo: ", listVideo);

async function main() {
  for (let i = 0; i < listVideo.length; i++) {
    const keyword = listVideo[i].split("|")[0].trim();
    const videoId = listVideo[i].split("|")[1].trim();
    console.log("current video: ", videoId);
    try {
      const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath:
          //"Application\\msedge.exe", // please change to your Edge path
          "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", // please change to your Edge path
      });
      const page = await browser.newPage();

      await page.waitForTimeout(1000 * timeStartWait);

      await page.goto("https://www.youtube.com");
      await page.waitForTimeout(1000 * 5);
      await page.type("input#search", keyword, { timeout: 0 });
      await page.keyboard.press("Enter");

      // Wait for search results to load
      //await page.waitForNavigation();

      await page.waitForTimeout(1000 * 30);

      // Click on the filter button
      await page.click(
        "#container > ytd-toggle-button-renderer > yt-button-shape > button",
        { timeout: 0 }
      );

      await page.waitForTimeout(5 * 1000);

      await page.evaluate(() => {
        const elements = document.querySelectorAll(
          "yt-formatted-string.style-scope.ytd-search-filter-renderer"
        );
        if (elements.length >= 6) {
          elements[5].click();
        }
      });

      await page.waitForTimeout(5 * 1000);

      // Click on the filter button
      await page.click(
        "#container > ytd-toggle-button-renderer > yt-button-shape > button",
        { timeout: 0 }
      );

      await page.waitForTimeout(5 * 1000);

      await page.evaluate(() => {
        const elements = document.querySelectorAll(
          "yt-formatted-string.style-scope.ytd-search-filter-renderer"
        );
        if (elements.length >= 6) {
          elements[12].click();
        }
      });

      await page.waitForTimeout(30 * 1000);

      // Click on the video
      const video = await page.$(`a[href*="/watch?v=${videoId}"]`);
      if (video) await video.click({ timeout: 0 });

      // Wait to watch video
      await page.waitForTimeout(1000 * 60 * 60 * timeWatching);

      const randomVideoBeside = await page.$(
        "#dismissible > div > div.metadata.style-scope.ytd-compact-video-renderer > a"
      );
      if (randomVideoBeside) await randomVideoBeside.click({ timeout: 0 });

      await page.waitForTimeout(15 * 1000);

      await browser.close();
    } catch (e) {
      console.log(e);
    }
  }
}

main();
