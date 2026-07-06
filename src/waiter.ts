import type { Address, Hex } from 'viem';
import { getEvents, getTransfers } from './events.js';
import type { EventArgsOf, EventNameOf, EventsOf, EventSource, Viem } from './types.js';

export async function waitFor<T>(
    name: string,
    predicate: () => Promise<T | null | false>,
    retries = 720,
    delayMs = 1000,
): Promise<T> {
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

export function waitForEnter(msg: string = 'Press Enter to continue...'): Promise<void> {
    if (process.env.CI) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        console.log(msg);

        process.stdin.once('data', () => {
            process.stdin.pause();
            resolve();
        });
    });
}

export async function waitForEvent<
    Source extends EventSource,
    EventName extends EventNameOf<Source>,
>(
    name: string,
    viem: Viem,
    source: Source,
    eventName: EventName,
    eventArgs?: EventArgsOf<Source, EventName>,
    txHash?: Hex,
    fromBlock: bigint = 0n,
    toBlock?: bigint,
): Promise<EventsOf<Source, EventName>> {
    return await waitFor(name, async () => {
        const events = await getEvents(
            viem,
            source,
            eventName,
            eventArgs,
            txHash,
            fromBlock,
            toBlock,
        );
        return events.length > 0 ? events : null; // null means we should keep looking.
    });
}

export async function waitForTransfers<Source extends EventSource>(
    name: string,
    viem: Viem,
    source: Source,
    fromAddress?: Address,
    toAddress?: Address,
    txHash?: Hex,
    fromBlock: bigint = 0n,
    toBlock?: bigint,
): Promise<EventsOf<Source, Extract<EventNameOf<Source>, 'Transfer'>>> {
    return await waitFor(name, async () => {
        const transfers = await getTransfers(
            viem,
            source,
            fromAddress,
            toAddress,
            txHash,
            fromBlock,
            toBlock,
        );
        return transfers.length > 0 ? transfers : null; // null means we should keep looking.
    });
}
