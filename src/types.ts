import '@nomicfoundation/hardhat-toolbox-viem';
import type { network } from 'hardhat';
import type { GetContractReturnType } from 'viem';
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
