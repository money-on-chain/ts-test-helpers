import '@nomicfoundation/hardhat-toolbox-viem';
import type { network } from 'hardhat';
import type { Abi, ContractEventArgs, ContractEventName, GetContractReturnType } from 'viem';
import type { GetContractEventsReturnType } from 'viem/actions';
import type { ArtifactMap } from 'hardhat/types/artifacts';

export type Viem = Awaited<ReturnType<typeof network.create>>['viem'];

export type PublicClient = Awaited<ReturnType<Viem['getPublicClient']>>;
export type WalletClients = Awaited<ReturnType<Viem['getWalletClients']>>;
export type WalletClient = WalletClients[number];
export type DeployClient = {
    public: PublicClient;
    wallet: WalletClient;
};

export type ContractOf<Name extends keyof ArtifactMap> = GetContractReturnType<
    ArtifactMap[Name]['abi'],
    DeployClient
>;

export type NetworkHelpers = Awaited<ReturnType<typeof network.create>>['networkHelpers'];

export type EventSource = {
    abi: Abi;
    getEvents: Record<string, unknown>;
};

export type EventNameOf<Source extends EventSource> = keyof Source['getEvents'] &
    ContractEventName<Source['abi']> &
    string;

export type EventArgsOf<
    Source extends EventSource,
    EventName extends EventNameOf<Source>,
> = ContractEventArgs<Source['abi'], EventName>;

export type EventsOf<
    Source extends EventSource,
    EventName extends EventNameOf<Source>,
> = GetContractEventsReturnType<Source['abi'], EventName>;

export type EventOf<Source extends EventSource, EventName extends EventNameOf<Source>> =
    EventsOf<Source, EventName> extends readonly (infer Event)[] ? Event : never;

export type EventFetcher<Source extends EventSource, EventName extends EventNameOf<Source>> = (
    args?: EventArgsOf<Source, EventName>,
    options?: unknown,
) => Promise<EventsOf<Source, EventName>>;
