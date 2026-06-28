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
import { artifacts } from "hardhat";
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
    static async default(viem) {
        return this.withSigner(viem, 0);
    }
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
    async deploy(contractName, constructorArgs, config) {
        return Deployer.deployInternal(this.viem, this.publicClient, this.walletClient, contractName, constructorArgs ?? [], config ?? {});
    }
    async deployProxy(contractName, initArgs) {
        const logicAddress = await this.getOrDeployImpl(contractName);
        const artifact = await artifacts.readArtifact(contractName);
        const initData = encodeFunctionData({
            abi: artifact.abi,
            functionName: "initialize",
            args: initArgs,
        });
        const proxy = await this.deployByName("TransparentUpgradeableProxy", [
            logicAddress,
            this.proxyAdmin.address,
            initData,
        ]);
        return this.getContractAt(contractName, proxy.address);
    }
    async deployUUPSProxy(contractName, initArgs) {
        const logicAddress = await this.getOrDeployImpl(contractName);
        const artifact = await artifacts.readArtifact(contractName);
        const initData = encodeFunctionData({
            abi: artifact.abi,
            functionName: "initialize",
            args: initArgs,
        });
        const proxy = await this.deployByName("ERC1967Proxy", [
            logicAddress,
            initData,
        ]);
        return this.getContractAt(contractName, proxy.address);
    }
    async getOrDeployImpl(contractName) {
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