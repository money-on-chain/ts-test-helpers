import type { Address, Hex } from 'viem';
import type {
    EventArgsOf,
    EventFetcher,
    EventNameOf,
    EventsOf,
    EventSource,
    Viem,
} from './types.js';

export async function getEvents<Source extends EventSource, EventName extends EventNameOf<Source>>(
    viem: Viem,
    source: Source,
    eventName: EventName,
    eventArgs?: EventArgsOf<Source, EventName>,
    txHash?: Hex,
    fromBlock: bigint = 0n,
    toBlock?: bigint,
): Promise<EventsOf<Source, EventName>> {
    const publicClient = await viem.getPublicClient();
    const getEvents = source.getEvents[eventName] as EventFetcher<Source, EventName>;

    if (txHash) {
        const tx = await publicClient.getTransactionReceipt({ hash: txHash });
        const events = await getEvents(eventArgs, { blockHash: tx.blockHash });
        return events.filter((event) => event.transactionHash === txHash);
    }

    return await getEvents(eventArgs, { fromBlock, toBlock });
}

export async function getTransfers<Source extends EventSource>(
    viem: Viem,
    source: Source,
    fromAddress?: Address,
    toAddress?: Address,
    txHash?: Hex,
    fromBlock: bigint = 0n,
    toBlock?: bigint,
): Promise<EventsOf<Source, Extract<EventNameOf<Source>, 'Transfer'>>> {
    return await getEvents(
        viem,
        source,
        'Transfer' as Extract<EventNameOf<Source>, 'Transfer'>,
        { from: fromAddress, to: toAddress } as EventArgsOf<
            Source,
            Extract<EventNameOf<Source>, 'Transfer'>
        >,
        txHash,
        fromBlock,
        toBlock,
    );
}
