const { spawn } = require("child_process");

module.exports = (url, dir) =>
  new Promise((resolve) => {
    const download = spawn(
      "youtube-dl",
      ["--extract-audio", "--audio-format", "mp3", url],
      { cwd: dir }
    );

    download.stdout.pipe(process.stdout);
    download.stderr.pipe(process.stderr);

    download.on("close", resolve);
  });
