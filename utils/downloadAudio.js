const { spawn } = require("child_process");
const { constants } = require("youtube-dl-exec")

module.exports = (url, dir) =>
  new Promise((resolve) => {
    const download = spawn(
      constants.YOUTUBE_DL_PATH,
      ["--extract-audio", "--audio-format", "mp3", url],
      { cwd: dir }
    );

    download.stdout.pipe(process.stdout);
    download.stderr.pipe(process.stderr);

    download.on("close", resolve);
  });
