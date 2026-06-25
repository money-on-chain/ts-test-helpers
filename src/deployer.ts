/*
Utility class for deploying proxy+contract and initializing on one step,
caching implementations so we don't deploy the same implementation twice.
Always uses the same deployer address.

Usage:

import { network } from "hardhat";
import { governedERC20Abi } from "./abi/GovernedERC20.js";

const { viem } = await network.connect();

const deployer = await Deployer.default(viem);
// or:
const deployer = await Deployer.withSigner(viem, 1);

const direct = await deployer.deploy("GovernedERC20", [
  "Token",
  "TKN",
]);

const proxied = await deployer.deployProxy(
  "GovernedERC20",
  governedERC20Abi,
  "initialize",
  [... initializer args ...],
);
*/

import type {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
} from "viem";
import { encodeFunctionData, getAddress } from "viem";

type AnyFunc = (...args: any[]) => any;

type HardhatViemLike = {
  getPublicClient: AnyFunc;
  getWalletClients: AnyFunc;
  deployContract: AnyFunc;
  getContractAt: AnyFunc;
};

type PublicClientOf<V extends HardhatViemLike> = Awaited<
  ReturnType<V["getPublicClient"]>
>;

type WalletClientOf<V extends HardhatViemLike> = Awaited<
  ReturnType<V["getWalletClients"]>
>[number];

type DeployArgs<V extends HardhatViemLike> = Parameters<V["deployContract"]>;

type DeployReturn<V extends HardhatViemLike> = Awaited<
  ReturnType<V["deployContract"]>
>;

type GetContractAtReturn<V extends HardhatViemLike> = Awaited<
  ReturnType<V["getContractAt"]>
>;

type InitializerName<TAbi extends Abi> = ContractFunctionName<
  TAbi,
  "nonpayable" | "payable"
>;

type InitializerArgs<
  TAbi extends Abi,
  TInitializer extends InitializerName<TAbi>,
> = ContractFunctionArgs<TAbi, "nonpayable" | "payable", TInitializer>;

export class Deployer<V extends HardhatViemLike> {
  private readonly implCache = new Map<string, Promise<Address>>();

  private constructor(
    public readonly viem: V,
    public readonly publicClient: PublicClientOf<V>,
    public readonly walletClient: WalletClientOf<V>,
    public readonly proxyAdmin: DeployReturn<V>,
  ) {}

  /**
   * Build a default deployer using wallet index 0.
   */
  static async default<V extends HardhatViemLike>(
    viem: V,
  ): Promise<Deployer<V>> {
    return this.withSigner(viem, 0);
  }

  /**
   * Build a deployer using the wallet at `walletIndex`.
   *
   * Every deployment performed through this Deployer uses that wallet.
   */
  static async withSigner<V extends HardhatViemLike>(
    viem: V,
    walletIndex = 0,
  ): Promise<Deployer<V>> {
    const publicClient = await viem.getPublicClient();
    const walletClients = await viem.getWalletClients();
    const walletClient = walletClients[walletIndex];

    if (walletClient === undefined) {
      throw new Error(`No viem wallet client at index ${walletIndex}`);
    }

    if (walletClient.account === undefined) {
      throw new Error(
        `Viem wallet client at index ${walletIndex} has no account`,
      );
    }

    const proxyAdmin = await Deployer.deployInternal(
      viem,
      publicClient,
      walletClient,
      "ProxyAdmin",
      [],
    );

    return new Deployer(viem, publicClient, walletClient, proxyAdmin);
  }

  /**
   * Typed deploy wrapper.
   *
   * Callers get the same argument checking as viem.deployContract.
   */
  async deploy(...args: DeployArgs<V>): Promise<DeployReturn<V>> {
    const rawArgs = args as unknown as [
      string,
      unknown[] | undefined,
      Record<string, unknown> | undefined,
    ];

    const contractName = rawArgs[0];
    const constructorArgs = rawArgs[1] ?? [];
    const config = rawArgs[2] ?? {};

    return Deployer.deployInternal(
      this.viem,
      this.publicClient,
      this.walletClient,
      contractName,
      constructorArgs,
      config,
    );
  }

  /**
   * Deploys a TransparentUpgradeableProxy.
   *
   * The initializer name and args are checked against the ABI passed in.
   */
  async deployProxy<
    const TAbi extends Abi,
    const TInitializer extends InitializerName<TAbi>,
  >(
    contractName: string,
    abi: TAbi,
    initializer: TInitializer,
    initArgs: InitializerArgs<TAbi, TInitializer>,
  ): Promise<GetContractAtReturn<V>> {
    const logicAddress = await this.getOrDeployImpl(contractName);

    const initData = encodeFunctionData({
      abi,
      functionName: initializer,
      args: initArgs,
    } as any);

    const proxy = await this.deployByName("TransparentUpgradeableProxy", [
      logicAddress,
      this.proxyAdmin.address,
      initData,
    ]);

    return this.getContractAt(contractName, proxy.address);
  }

  /**
   * Deploys an ERC1967Proxy / UUPS proxy.
   *
   * The initializer name and args are checked against the ABI passed in.
   */
  async deployUUPSProxy<
    const TAbi extends Abi,
    const TInitializer extends InitializerName<TAbi>,
  >(
    contractName: string,
    abi: TAbi,
    initializer: TInitializer,
    initArgs: InitializerArgs<TAbi, TInitializer>,
  ): Promise<GetContractAtReturn<V>> {
    const logicAddress = await this.getOrDeployImpl(contractName);

    const initData = encodeFunctionData({
      abi,
      functionName: initializer,
      args: initArgs,
    } as any);

    const proxy = await this.deployByName("ERC1967Proxy", [
      logicAddress,
      initData,
    ]);

    return this.getContractAt(contractName, proxy.address);
  }

  private async getOrDeployImpl(contractName: string): Promise<Address> {
    const key = contractName;

    let deployment = this.implCache.get(key);

    if (deployment === undefined) {
      deployment = (async () => {
        const implementation = await this.deployByName(contractName, []);
        return getAddress(implementation.address);
      })();

      this.implCache.set(key, deployment);
    }

    return deployment;
  }

  private async deployByName(
    contractName: string,
    constructorArgs: readonly unknown[] = [],
    config: Record<string, unknown> = {},
  ): Promise<DeployReturn<V>> {
    return Deployer.deployInternal(
      this.viem,
      this.publicClient,
      this.walletClient,
      contractName,
      constructorArgs,
      config,
    );
  }

  private async getContractAt(
    contractName: string,
    address: Address,
  ): Promise<GetContractAtReturn<V>> {
    return this.viem.getContractAt(contractName, address, {
      client: {
        public: this.publicClient,
        wallet: this.walletClient,
      },
    });
  }

  private static async deployInternal<V extends HardhatViemLike>(
    viem: V,
    publicClient: PublicClientOf<V>,
    walletClient: WalletClientOf<V>,
    contractName: string,
    constructorArgs: readonly unknown[] = [],
    config: Record<string, unknown> = {},
  ): Promise<DeployReturn<V>> {
    return viem.deployContract(contractName, constructorArgs, {
      ...config,
      client: {
        ...((config.client as Record<string, unknown> | undefined) ?? {}),
        public: publicClient,
        wallet: walletClient,
      },
    });
  }
}
