import type { ArtifactMap, StringWithArtifactContractNamesAutocompletion } from "hardhat/types/artifacts";
import type { Address, ContractConstructorArgs, ContractFunctionArgs, ContractFunctionName, GetContractReturnType } from "viem";
import type { Viem, DeployClient, PublicClient, WalletClient } from "./types.js";
export type DeployArgs = Parameters<Viem["deployContract"]>;
export type ConstructorArgs<ContractName> = ContractName extends keyof ArtifactMap ? ContractConstructorArgs<ContractAbi<ContractName>> : unknown[];
type DeployContractConfig = NonNullable<Parameters<Viem["deployContract"]>[2]>;
export type DeployReturn<ContractName extends StringWithArtifactContractNamesAutocompletion = StringWithArtifactContractNamesAutocompletion> = GetContractReturnType<ContractAbi<ContractName>, DeployClient, Address>;
type ContractAbi<ContractName> = ContractName extends keyof ArtifactMap ? ArtifactMap[ContractName]["abi"] : readonly unknown[];
type InitializerName<ContractName> = ContractFunctionName<ContractAbi<ContractName>, "nonpayable" | "payable">;
type InitializerArgs<ContractName, TInitializer extends InitializerName<ContractName>> = ContractFunctionArgs<ContractAbi<ContractName>, "nonpayable" | "payable", TInitializer>;
type DefaultInitializerName<ContractName> = Extract<InitializerName<ContractName>, "initialize">;
export declare class Deployer {
    readonly viem: Viem;
    readonly publicClient: PublicClient;
    readonly walletClient: WalletClient;
    readonly proxyAdmin: DeployReturn<"ProxyAdmin">;
    private readonly implCache;
    private constructor();
    static default<V extends Viem>(viem: V): Promise<Deployer>;
    static withSigner(viem: Viem, walletIndex?: number): Promise<Deployer>;
    deploy<ContractName extends StringWithArtifactContractNamesAutocompletion>(contractName: ContractName, constructorArgs?: ConstructorArgs<ContractName>, config?: DeployContractConfig): Promise<DeployReturn<ContractName>>;
    deployProxy<ContractName extends StringWithArtifactContractNamesAutocompletion>(contractName: ContractName, initArgs: InitializerArgs<ContractName, DefaultInitializerName<ContractName>>): Promise<DeployReturn<ContractName>>;
    deployUUPSProxy<ContractName extends StringWithArtifactContractNamesAutocompletion>(contractName: ContractName, initArgs: InitializerArgs<ContractName, DefaultInitializerName<ContractName>>): Promise<DeployReturn<ContractName>>;
    private getOrDeployImpl;
    private deployByName;
    private getContractAt;
    private static deployInternal;
}
export {};
//# sourceMappingURL=deployer.d.ts.map