/*
Utility class for deploying proxy+contract and initializing on one step,
caching implementations so we don't deploy the same implementation twice.
Always uses the same deployer address.

Usage:

import { network } from "hardhat";

const { viem } = await network.connect();

const deployer = await Deployer.default(viem);
// or:
const deployer = await Deployer.withSigner(viem, 1);

const direct = await deployer.deploy("ERC20", [
  "Token",
  "TKN",
]);

const proxied = await deployer.deployProxy(
  "ERC20",
  "initialize",
  [... initializer args ...],
);
*/

import { artifacts } from 'hardhat';
import type {
    ArtifactMap,
    StringWithArtifactContractNamesAutocompletion,
} from 'hardhat/types/artifacts';
import type {
    Address,
    ContractConstructorArgs,
    ContractFunctionArgs,
    ContractFunctionName,
    GetContractReturnType,
} from 'viem';
import { encodeFunctionData, getAddress } from 'viem';
import type { Viem, DeployClient, PublicClient, WalletClient } from './types.js';

export type DeployArgs = Parameters<Viem['deployContract']>;

export type ConstructorArgs<ContractName> = ContractName extends keyof ArtifactMap
    ? ContractConstructorArgs<ContractAbi<ContractName>>
    : unknown[];

type DeployContractConfig = NonNullable<Parameters<Viem['deployContract']>[2]>;

export type DeployReturn<
    ContractName extends StringWithArtifactContractNamesAutocompletion =
        StringWithArtifactContractNamesAutocompletion,
> = GetContractReturnType<ContractAbi<ContractName>, DeployClient, Address>;

type ContractAbi<ContractName> = ContractName extends keyof ArtifactMap
    ? ArtifactMap[ContractName]['abi']
    : readonly unknown[];

type InitializerName<ContractName> = ContractFunctionName<
    ContractAbi<ContractName>,
    'nonpayable' | 'payable'
>;

type InitializerArgs<
    ContractName,
    TInitializer extends InitializerName<ContractName>,
> = ContractFunctionArgs<ContractAbi<ContractName>, 'nonpayable' | 'payable', TInitializer>;

type DefaultInitializerName<ContractName> = Extract<InitializerName<ContractName>, 'initialize'>;

export class Deployer {
    private readonly implCache = new Map<string, Promise<Address>>();

    private constructor(
        public readonly viem: Viem,
        public readonly publicClient: PublicClient,
        public readonly walletClient: WalletClient,
        public readonly proxyAdmin: DeployReturn<'ProxyAdmin'>,
    ) {}

    static async default<V extends Viem>(viem: V): Promise<Deployer> {
        return this.withSigner(viem, 0);
    }

    static async withSigner(viem: Viem, walletIndex = 0): Promise<Deployer> {
        const publicClient = await viem.getPublicClient();
        const walletClients = await viem.getWalletClients();
        const walletClient = walletClients[walletIndex];

        if (walletClient === undefined) {
            throw new Error(`No viem wallet client at index ${walletIndex}`);
        }

        if (walletClient.account === undefined) {
            throw new Error(`Viem wallet client at index ${walletIndex} has no account`);
        }

        const proxyAdmin = await Deployer.deployInternal(
            viem,
            publicClient,
            walletClient,
            'ProxyAdmin',
            [],
        );

        return new Deployer(viem, publicClient, walletClient, proxyAdmin);
    }

    async deploy<ContractName extends StringWithArtifactContractNamesAutocompletion>(
        contractName: ContractName,
        constructorArgs?: ConstructorArgs<ContractName>,
        config?: DeployContractConfig,
    ): Promise<DeployReturn<ContractName>> {
        return Deployer.deployInternal(
            this.viem,
            this.publicClient,
            this.walletClient,
            contractName,
            constructorArgs ?? ([] as ConstructorArgs<ContractName>),
            config ?? {},
        );
    }

    async deployProxy<ContractName extends StringWithArtifactContractNamesAutocompletion>(
        contractName: ContractName,
        initArgs: InitializerArgs<ContractName, DefaultInitializerName<ContractName>>,
    ): Promise<DeployReturn<ContractName>> {
        return this.deployInitializedProxy(contractName, 'TransparentUpgradeableProxy', initArgs);
    }

    async deployUninitializedProxy<
        ContractName extends StringWithArtifactContractNamesAutocompletion,
    >(contractName: ContractName): Promise<DeployReturn<ContractName>> {
        return this.deployInitializedProxy(contractName, 'TransparentUpgradeableProxy');
    }

    async deployUUPSProxy<ContractName extends StringWithArtifactContractNamesAutocompletion>(
        contractName: ContractName,
        initArgs: InitializerArgs<ContractName, DefaultInitializerName<ContractName>>,
    ): Promise<DeployReturn<ContractName>> {
        return this.deployInitializedProxy(contractName, 'ERC1967Proxy', initArgs);
    }

    async deployUninitializedUUPSProxy<
        ContractName extends StringWithArtifactContractNamesAutocompletion,
    >(contractName: ContractName): Promise<DeployReturn<ContractName>> {
        return this.deployInitializedProxy(contractName, 'ERC1967Proxy');
    }

    private async deployInitializedProxy<
        ContractName extends StringWithArtifactContractNamesAutocompletion,
        ProxyName extends 'TransparentUpgradeableProxy' | 'ERC1967Proxy',
    >(
        contractName: ContractName,
        proxyName: ProxyName,
        initArgs?: InitializerArgs<ContractName, DefaultInitializerName<ContractName>>,
    ): Promise<DeployReturn<ContractName>> {
        const logicAddress = await this.getOrDeployImpl(contractName);
        const artifact = await artifacts.readArtifact(contractName);
        const initData =
            initArgs === undefined
                ? '0x'
                : encodeFunctionData({
                      abi: artifact.abi,
                      functionName: 'initialize',
                      args: initArgs,
                  } as never);

        const proxyArgs =
            proxyName === 'TransparentUpgradeableProxy'
                ? [logicAddress, this.proxyAdmin.address, initData]
                : [logicAddress, initData];

        const proxy = await this.deployByName(proxyName, proxyArgs as never);

        return this.getContractAt(contractName, proxy.address);
    }

    private async getOrDeployImpl(contractName: string): Promise<Address> {
        let deployment = this.implCache.get(contractName);

        if (deployment === undefined) {
            deployment = (async () => {
                const implementation = await this.deployByName(contractName, []);
                return getAddress(implementation.address);
            })();

            this.implCache.set(contractName, deployment);
        }

        return deployment;
    }

    private async deployByName<ContractName extends StringWithArtifactContractNamesAutocompletion>(
        contractName: ContractName,
        constructorArgs: ConstructorArgs<ContractName> = [] as ConstructorArgs<ContractName>,
        config: DeployContractConfig = {},
    ): Promise<DeployReturn<ContractName>> {
        return Deployer.deployInternal(
            this.viem,
            this.publicClient,
            this.walletClient,
            contractName,
            constructorArgs,
            config,
        );
    }

    private async getContractAt<ContractName extends StringWithArtifactContractNamesAutocompletion>(
        contractName: ContractName,
        address: Address,
    ): Promise<DeployReturn<ContractName>> {
        return this.viem.getContractAt(contractName, address, {
            client: {
                public: this.publicClient,
                wallet: this.walletClient,
            },
        }) as Promise<DeployReturn<ContractName>>;
    }

    private static async deployInternal<
        ContractName extends StringWithArtifactContractNamesAutocompletion,
    >(
        viem: Viem,
        publicClient: PublicClient,
        walletClient: WalletClient,
        contractName: ContractName,
        constructorArgs: ConstructorArgs<ContractName> = [] as ConstructorArgs<ContractName>,
        config: DeployContractConfig = {},
    ): Promise<DeployReturn<ContractName>> {
        return viem.deployContract(contractName, constructorArgs, {
            ...config,
            client: {
                ...(config.client ?? {}),
                public: publicClient,
                wallet: walletClient,
            },
        }) as unknown as Promise<DeployReturn<ContractName>>;
    }
}
