import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
// The caller chooses its log destination independently of CI or source location.
export function getTestTempDir() {
    const dir = process.env.TEST_LOG_DIR ?? os.tmpdir();
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}
export function getTestTempPath(fileName) {
    return path.join(getTestTempDir(), fileName);
}
//# sourceMappingURL=logPaths.js.map