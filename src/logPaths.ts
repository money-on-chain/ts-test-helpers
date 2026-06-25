import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CI_LOG_DIR =
  process.env.CI && process.env.GITHUB_WORKSPACE ? path.join(process.env.GITHUB_WORKSPACE, "logs") : null;

export function getTestTempDir(): string {
  const dir = CI_LOG_DIR ?? os.tmpdir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getTestTempPath(fileName: string): string {
  return path.join(getTestTempDir(), fileName);
}
