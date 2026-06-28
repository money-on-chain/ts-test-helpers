import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getTestTempDir } from "./logPaths.js";
const LOG_DIR = getTestTempDir();
const LOG_PREFIXES = ["omoc-", "moc-", "roc_"];
const sanitizeTestName = (name) => name
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120) || "unknown";
const collectLogFiles = () => {
    const entries = fs.readdirSync(LOG_DIR, { withFileTypes: true });
    return entries
        .filter(entry => entry.isFile() && LOG_PREFIXES.some(prefix => entry.name.startsWith(prefix)))
        .map(entry => path.join(LOG_DIR, entry.name));
};
export const archiveFailedTestLogs = (testName) => {
    const files = collectLogFiles();
    if (!files.length) {
        return;
    }
    const safeName = sanitizeTestName(testName);
    const archivePath = path.join(LOG_DIR, `failed-test-${safeName}.tgz`);
    const tempDir = fs.mkdtempSync(path.join(LOG_DIR, "failed-test-logs-"));
    try {
        for (const file of files) {
            const basename = path.basename(file);
            const dest = path.join(tempDir, basename);
            fs.copyFileSync(file, dest);
        }
        const result = spawnSync("tar", ["-czf", archivePath, "-C", tempDir, "."], { stdio: "inherit" });
        if (result.status !== 0) {
            console.warn(`[TestLogs] Failed to archive logs for ${safeName}`);
            return;
        }
    }
    finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    console.log(`[TestLogs] Archived logs to ${archivePath}`);
};
//# sourceMappingURL=archiveFailedTestLogs.js.map