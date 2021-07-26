const { unlinkSync, renameSync } = require("fs");
const { spawn } = require("child_process");
const path = require("path");

module.exports = (initialFileName, data, dir) =>
  new Promise((resolve) => {
    const metadata = spawn(
      "ffmpeg",
      [
        "-i",
        initialFileName,
        "-metadata",
        `title="${data.title}"`,
        "-c",
        "copy",
        "edited.mp3",
      ],
      { cwd: dir }
    );

    metadata.stdout.pipe(process.stdout);
    metadata.stderr.pipe(process.stderr);

    metadata.on("close", () => {
      const baseName = path.join(dir, initialFileName);

      unlinkSync(baseName); // Remove downloaded file
      renameSync(path.join(dir, "edited.mp3"), baseName); // change edited.mp3 to real name

      resolve();
    });
  });
