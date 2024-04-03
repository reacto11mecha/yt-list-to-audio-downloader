const { unlinkSync, renameSync } = require("fs");
const { spawn } = require("child_process");
const path = require("path");

const getParameter = (initialFileName, data) => {
  if (data.album)
    return [
      "-i",
      initialFileName,

      "-metadata",
      `title=${data.title}`,

      "-metadata",
      `album=${data.album}`,

      "-metadata",
      `artist=${data.artist}`,

      "-c",
      "copy",
      "edited.mp3",
    ];

  return [
    "-i",
    initialFileName,

    "-metadata",
    `title=${data.title}`,

    "-metadata",
    `artist=${data.artist}`,

    "-c",
    "copy",
    "edited.mp3",
  ];
};

module.exports = (initialFileName, data, dir) =>
  new Promise((resolve) => {
    const ffmpegArg = getParameter(initialFileName, data);

    const metadata = spawn(
      "ffmpeg",
      ffmpegArg,
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
