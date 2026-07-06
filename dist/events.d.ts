import type { Address, Hex } from 'viem';
import type { EventArgsOf, EventNameOf, EventsOf, EventSource, Viem } from './types.js';
export declare function getEvents<Source extends EventSource, EventName extends EventNameOf<Source>>(viem: Viem, source: Source, eventName: EventName, eventArgs?: EventArgsOf<Source, EventName>, txHash?: Hex, fromBlock?: bigint, toBlock?: bigint): Promise<EventsOf<Source, EventName>>;
export declare function getTransfers<Source extends EventSource>(viem: Viem, source: Source, fromAddress?: Address, toAddress?: Address, txHash?: Hex, fromBlock?: bigint, toBlock?: bigint): Promise<EventsOf<Source, Extract<EventNameOf<Source>, 'Transfer'>>>;
//# sourceMappingURL=events.d.ts.map