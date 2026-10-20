import { createInterface } from 'node:readline/promises';
import { getEvents, getTransfers } from './events.js';
export async function waitFor(name, predicate, retries = 720, delayMs = 1000) {
    process.stdout.write(name);
    for (let i = 0; i < retries; i += 1) {
        const value = await predicate();
        if (value != null && value !== false) {
            console.log('ok!');
            return value;
        }
        process.stdout.write('.');
        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    console.log('failed!');
    throw new Error(`waitFor(${name}) timed out after ${retries} attempts`);
}
// Automated runs opt out explicitly; a process without a terminal cannot pause.
export async function waitForEnter(msg = 'Press Enter to continue...') {
    if (process.env.NON_INTERACTIVE === 'true' || !process.stdin.isTTY)
        return;
    const terminal = createInterface({ input: process.stdin, output: process.stdout });
    try {
        await terminal.question(msg);
    }
    finally {
        terminal.close();
    }
}
export async function waitForEvent(name, viem, source, eventName, eventArgs, txHash, fromBlock = 0n, toBlock) {
    return await waitFor(name, async () => {
        const events = await getEvents(viem, source, eventName, eventArgs, txHash, fromBlock, toBlock);
        return events.length > 0 ? events : null; // null means we should keep looking.
    });
}
export async function waitForTransfers(name, viem, source, fromAddress, toAddress, txHash, fromBlock = 0n, toBlock) {
    return await waitFor(name, async () => {
        const transfers = await getTransfers(viem, source, fromAddress, toAddress, txHash, fromBlock, toBlock);
        return transfers.length > 0 ? transfers : null; // null means we should keep looking.
    });
}
//# sourceMappingURL=waiter.js.map