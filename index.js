const sanitize = require("sanitize-filename");
const youtubedl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");

const downloadAudio = require("./utils/downloadAudio");
const metadataWriter = require("./utils/metadataWriter");
const getYtID = require("./utils/getYtID");

const resultDir = path.join(__dirname, "result");

const getFolderMP3 = (mainFolder) =>
  fs.readdirSync(mainFolder).filter((file) => file.includes(".mp3"));

const mustDownloadVideos = (() => {
  const videos = require("./videos");

  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
    return videos;
  }

  const directories = fs.readdirSync(resultDir)
    .filter((item) => item !== ".stfolder")
    .filter((item) => item !== ".stignore");

  const reservedIDS = videos.map((url) => ({ id: getYtID(url), url }));
  const alreadyIDS = directories.map((directory) => {
    const data = JSON.parse(
      fs.readFileSync(path.join(resultDir, directory, "data.json"), "utf8")
    );

    return { id: data.id, directory };
  });

  return reservedIDS
    .map(({ id, url }) => {
      const video = alreadyIDS.find((aID) => aID.id === id);

      if (video !== undefined)
        return getFolderMP3(path.join(resultDir, video.directory)).length < 1
          ? url
          : false;

      return url;
    })
    .filter((url) => url !== false);
})();

(async () => {
  if (mustDownloadVideos.length > 0) {
    console.log("Starting\n");

    for (const video of mustDownloadVideos) {
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
  } else {
    console.log("Nothing to download here :)");
  }
})();
