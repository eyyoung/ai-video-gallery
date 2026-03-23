import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";

const FFMPEG_BIN = "ffmpeg";

/**
 * Extracts a thumbnail from a video at the given seek time using ffmpeg.
 * Returns the public URL path (e.g. "/uploads/thumb-xxx.jpg").
 */
export async function generateThumbnail(
  videoPublicPath: string,
  seekSeconds = 1
): Promise<string> {
  const videoAbsPath = path.join(process.cwd(), "public", videoPublicPath);

  await access(videoAbsPath);

  const stem = path.basename(videoAbsPath, path.extname(videoAbsPath));
  const thumbFilename = `thumb-${stem}.jpg`;
  const thumbAbsPath = path.join(process.cwd(), "public", "uploads", thumbFilename);
  const thumbPublicPath = `/uploads/${thumbFilename}`;

  await runFfmpeg([
    "-ss", String(seekSeconds),
    "-i", videoAbsPath,
    "-frames:v", "1",
    "-update", "1",
    "-q:v", "2",
    "-vf", "scale='min(1280,iw)':-2",
    "-y",
    thumbAbsPath
  ]);

  return thumbPublicPath;
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(FFMPEG_BIN, args, { timeout: 30_000 }, (error, _stdout, stderr) => {
      if (error) {
        reject(new Error(`ffmpeg failed: ${stderr || error.message}`));
        return;
      }
      resolve();
    });
  });
}
