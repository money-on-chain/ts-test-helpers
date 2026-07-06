import type { Address, Hex } from 'viem';
import type { EventArgsOf, EventNameOf, EventsOf, EventSource, Viem } from './types.js';
export declare function waitFor<T>(name: string, predicate: () => Promise<T | null | false>, retries?: number, delayMs?: number): Promise<T>;
export declare function waitForEnter(msg?: string): Promise<void>;
export declare function waitForEvent<Source extends EventSource, EventName extends EventNameOf<Source>>(name: string, viem: Viem, source: Source, eventName: EventName, eventArgs?: EventArgsOf<Source, EventName>, txHash?: Hex, fromBlock?: bigint, toBlock?: bigint): Promise<EventsOf<Source, EventName>>;
export declare function waitForTransfers<Source extends EventSource>(name: string, viem: Viem, source: Source, fromAddress?: Address, toAddress?: Address, txHash?: Hex, fromBlock?: bigint, toBlock?: bigint): Promise<EventsOf<Source, Extract<EventNameOf<Source>, 'Transfer'>>>;
//# sourceMappingURL=waiter.d.ts.map