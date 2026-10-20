// These tests cover the shared runtime settings without deploying contracts.
// Log locations must be chosen explicitly, independent of CI workspace markers.
// Inspection prompts must respect unattended mode and terminal availability.
// Child processes isolate stdin, environment variables, and readline cleanup.
// The release includes generated dist files, so exercise those public artifacts.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { getTestTempDir, getTestTempPath } from '../src/logPaths.js';

test('dedicated logs override CI workspace markers and create the destination', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test-helper-logs-'));
    const previous = process.env.TEST_LOG_DIR;
    try {
        process.env.TEST_LOG_DIR = path.join(root, 'nested', 'logs');
        assert.equal(getTestTempDir(), process.env.TEST_LOG_DIR);
        assert.equal(
            getTestTempPath('browser.log'),
            path.join(process.env.TEST_LOG_DIR, 'browser.log'),
        );
        assert.ok(fs.statSync(process.env.TEST_LOG_DIR).isDirectory());
        delete process.env.TEST_LOG_DIR;
        assert.equal(getTestTempDir(), os.tmpdir());
    } finally {
        if (previous === undefined) delete process.env.TEST_LOG_DIR;
        else process.env.TEST_LOG_DIR = previous;
        fs.rmSync(root, { recursive: true, force: true });
    }
});

test('a terminal prompt remains interactive even when CI is set', () => {
    const result = spawnSync(
        process.execPath,
        [
            '--input-type=module',
            '-e',
            `
        import { waitForEnter } from './dist/waiter.js';
        Object.defineProperty(process.stdin, 'isTTY', { value: true });
        await waitForEnter('Inspect the workstation');
        console.log('continued');
    `,
        ],
        {
            env: { ...process.env, CI: 'true', NON_INTERACTIVE: 'false' },
            input: '\n',
            encoding: 'utf8',
            timeout: 5000,
        },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Inspect the workstation.*continued/s);
});

test('unattended mode and non-terminal stdin never pause', () => {
    for (const terminal of [true, false]) {
        const result = spawnSync(
            process.execPath,
            [
                '--input-type=module',
                '-e',
                `
            import { waitForEnter } from './dist/waiter.js';
            Object.defineProperty(process.stdin, 'isTTY', { value: ${terminal} });
            await waitForEnter('must not prompt');
            console.log('continued');
        `,
            ],
            {
                env: { ...process.env, NON_INTERACTIVE: terminal ? 'true' : 'false' },
                input: '',
                encoding: 'utf8',
                timeout: 5000,
            },
        );
        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stdout.trim(), 'continued');
    }
});
