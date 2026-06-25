import type { Abi, ContractFunctionArgs, ContractFunctionName } from "viem";
type AnyFunc = (...args: any[]) => any;
type HardhatViemLike = {
    getPublicClient: AnyFunc;
    getWalletClients: AnyFunc;
    deployContract: AnyFunc;
    getContractAt: AnyFunc;
};
type PublicClientOf<V extends HardhatViemLike> = Awaited<ReturnType<V["getPublicClient"]>>;
type WalletClientOf<V extends HardhatViemLike> = Awaited<ReturnType<V["getWalletClients"]>>[number];
type DeployArgs<V extends HardhatViemLike> = Parameters<V["deployContract"]>;
type DeployReturn<V extends HardhatViemLike> = Awaited<ReturnType<V["deployContract"]>>;
type GetContractAtReturn<V extends HardhatViemLike> = Awaited<ReturnType<V["getContractAt"]>>;
type InitializerName<TAbi extends Abi> = ContractFunctionName<TAbi, "nonpayable" | "payable">;
type InitializerArgs<TAbi extends Abi, TInitializer extends InitializerName<TAbi>> = ContractFunctionArgs<TAbi, "nonpayable" | "payable", TInitializer>;
export declare class Deployer<V extends HardhatViemLike> {
    readonly viem: V;
    readonly publicClient: PublicClientOf<V>;
    readonly walletClient: WalletClientOf<V>;
    readonly proxyAdmin: DeployReturn<V>;
    private readonly implCache;
    private constructor();
    /**
     * Build a default deployer using wallet index 0.
     */
    static default<V extends HardhatViemLike>(viem: V): Promise<Deployer<V>>;
    /**
     * Build a deployer using the wallet at `walletIndex`.
     *
     * Every deployment performed through this Deployer uses that wallet.
     */
    static withSigner<V extends HardhatViemLike>(viem: V, walletIndex?: number): Promise<Deployer<V>>;
    /**
     * Typed deploy wrapper.
     *
     * Callers get the same argument checking as viem.deployContract.
     */
    deploy(...args: DeployArgs<V>): Promise<DeployReturn<V>>;
    /**
     * Deploys a TransparentUpgradeableProxy.
     *
     * The initializer name and args are checked against the ABI passed in.
     */
    deployProxy<const TAbi extends Abi, const TInitializer extends InitializerName<TAbi>>(contractName: string, abi: TAbi, initializer: TInitializer, initArgs: InitializerArgs<TAbi, TInitializer>): Promise<GetContractAtReturn<V>>;
    /**
     * Deploys an ERC1967Proxy / UUPS proxy.
     *
     * The initializer name and args are checked against the ABI passed in.
     */
    deployUUPSProxy<const TAbi extends Abi, const TInitializer extends InitializerName<TAbi>>(contractName: string, abi: TAbi, initializer: TInitializer, initArgs: InitializerArgs<TAbi, TInitializer>): Promise<GetContractAtReturn<V>>;
    private getOrDeployImpl;
    private deployByName;
    private getContractAt;
    private static deployInternal;
}
export {};
//# sourceMappingURL=deployer.d.ts.map