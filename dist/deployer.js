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
import { encodeFunctionData, getAddress } from "viem";
export class Deployer {
    viem;
    publicClient;
    walletClient;
    proxyAdmin;
    implCache = new Map();
    constructor(viem, publicClient, walletClient, proxyAdmin) {
        this.viem = viem;
        this.publicClient = publicClient;
        this.walletClient = walletClient;
        this.proxyAdmin = proxyAdmin;
    }
    /**
     * Build a default deployer using wallet index 0.
     */
    static async default(viem) {
        return this.withSigner(viem, 0);
    }
    /**
     * Build a deployer using the wallet at `walletIndex`.
     *
     * Every deployment performed through this Deployer uses that wallet.
     */
    static async withSigner(viem, walletIndex = 0) {
        const publicClient = await viem.getPublicClient();
        const walletClients = await viem.getWalletClients();
        const walletClient = walletClients[walletIndex];
        if (walletClient === undefined) {
            throw new Error(`No viem wallet client at index ${walletIndex}`);
        }
        if (walletClient.account === undefined) {
            throw new Error(`Viem wallet client at index ${walletIndex} has no account`);
        }
        const proxyAdmin = await Deployer.deployInternal(viem, publicClient, walletClient, "ProxyAdmin", []);
        return new Deployer(viem, publicClient, walletClient, proxyAdmin);
    }
    /**
     * Typed deploy wrapper.
     *
     * Callers get the same argument checking as viem.deployContract.
     */
    async deploy(...args) {
        const rawArgs = args;
        const contractName = rawArgs[0];
        const constructorArgs = rawArgs[1] ?? [];
        const config = rawArgs[2] ?? {};
        return Deployer.deployInternal(this.viem, this.publicClient, this.walletClient, contractName, constructorArgs, config);
    }
    /**
     * Deploys a TransparentUpgradeableProxy.
     *
     * The initializer name and args are checked against the ABI passed in.
     */
    async deployProxy(contractName, abi, initializer, initArgs) {
        const logicAddress = await this.getOrDeployImpl(contractName);
        const initData = encodeFunctionData({
            abi,
            functionName: initializer,
            args: initArgs,
        });
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
    async deployUUPSProxy(contractName, abi, initializer, initArgs) {
        const logicAddress = await this.getOrDeployImpl(contractName);
        const initData = encodeFunctionData({
            abi,
            functionName: initializer,
            args: initArgs,
        });
        const proxy = await this.deployByName("ERC1967Proxy", [
            logicAddress,
            initData,
        ]);
        return this.getContractAt(contractName, proxy.address);
    }
    async getOrDeployImpl(contractName) {
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
    async deployByName(contractName, constructorArgs = [], config = {}) {
        return Deployer.deployInternal(this.viem, this.publicClient, this.walletClient, contractName, constructorArgs, config);
    }
    async getContractAt(contractName, address) {
        return this.viem.getContractAt(contractName, address, {
            client: {
                public: this.publicClient,
                wallet: this.walletClient,
            },
        });
    }
    static async deployInternal(viem, publicClient, walletClient, contractName, constructorArgs = [], config = {}) {
        return viem.deployContract(contractName, constructorArgs, {
            ...config,
            client: {
                ...(config.client ?? {}),
                public: publicClient,
                wallet: walletClient,
            },
        });
    }
}
//# sourceMappingURL=deployer.js.map