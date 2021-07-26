const sanitize = require("sanitize-filename");
const youtubedl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");

const videos = require("./videos");
const downloadAudio = require("./utils/downloadAudio");
const metadataWriter = require("./utils/metadataWriter");

const resultDir = path.join(__dirname, "result");
if (!fs.existsSync(resultDir)) fs.mkdirSync(resultDir);

const getFolderMP3 = (mainFolder) =>
  fs.readdirSync(mainFolder).filter((file) => file.includes(".mp3"));

(async () => {
  console.log("Starting\n");

  for (const video of videos) {
    console.log(`Getting data: ${video}`);
    const data = await youtubedl(video, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });

    const { title, id } = data;

    console.log(`Data getted: ${title}`);

    const supposedName = sanitize(`${title}-${id}`);

    const mainFolder = path.join(resultDir, supposedName);
    if (!fs.existsSync(mainFolder)) fs.mkdirSync(mainFolder);

    const supposedMP3 = getFolderMP3(mainFolder);

    if (supposedMP3.length < 1) {
      console.log("Downloading file \n");
      await downloadAudio(video, mainFolder);
      console.log("\nDownloaded\n");

      const availableFile = getFolderMP3(mainFolder)[0];

      fs.writeFileSync(
        path.join(mainFolder, "data.json"),
        JSON.stringify(data, null, 2)
      );

      console.log("Rewriting metadata\n");
      await metadataWriter(availableFile, data, mainFolder);
      console.log("\nRewrited\n");
    } else {
      console.log("Already\n");
    }
  }

  console.log("Done");
})();
