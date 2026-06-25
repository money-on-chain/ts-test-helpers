import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import type { Address, Hex } from "viem";
import { getAddress, sliceHex } from "viem";

import { Deployer } from "../src/deployer.js";

const IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc" as const;
const ZERO_ADDRESS = getAddress("0x0000000000000000000000000000000000000000");

type MinimalPublicClient = {
  getBytecode(args: { address: Address }): Promise<Hex | undefined>;
  getStorageAt(args: { address: Address; slot: Hex }): Promise<Hex | undefined>;
};

describe("Deployer", async () => {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const walletClients = await viem.getWalletClients();

  it("initializes with a real viem instance and deploys ProxyAdmin", async () => {
    const deployer = await Deployer.default(viem);

    assert.equal(
      getAddress(deployer.walletClient.account.address),
      getAddress(walletClients[0].account.address),
    );
    assert.equal(
      getAddress(deployer.proxyAdmin.address),
      getAddress(deployer.proxyAdmin.address),
    );
    assert.notEqual(
      await publicClient.getBytecode({ address: deployer.proxyAdmin.address }),
      undefined,
    );
  });

  it("uses the selected wallet for direct deployment", async () => {
    const deployer = await Deployer.withSigner(viem, 1);
    const contract = await deployer.deploy("DummyDirectDeployment", ["constructor", 7n]);

    assert.equal(await contract.read.name(), "constructor");
    assert.equal(await contract.read.amount(), 7n);
    assert.equal(
      getAddress(await contract.read.constructorSender()),
      getAddress(walletClients[1].account.address),
    );
    assert.equal(
      getAddress(await contract.read.owner()),
      getAddress(walletClients[1].account.address),
    );
  });

  it("deploys transparent proxies and reuses the same implementation", async () => {
    const deployer = await Deployer.default(viem);

    const first = await deployer.deployProxy(
      "DummyProxyImplementation",
      proxyImplementationAbi,
      "initialize",
      ["proxy one", 11n, walletClients[0].account.address],
    );
    const second = await deployer.deployProxy(
      "DummyProxyImplementation",
      proxyImplementationAbi,
      "initialize",
      ["proxy two", 22n, walletClients[1].account.address],
    );

    assert.equal(await first.read.name(), "proxy one");
    assert.equal(await first.read.amount(), 11n);
    assert.equal(
      getAddress(await first.read.owner()),
      getAddress(walletClients[0].account.address),
    );

    assert.equal(await second.read.name(), "proxy two");
    assert.equal(await second.read.amount(), 22n);
    assert.equal(
      getAddress(await second.read.owner()),
      getAddress(walletClients[1].account.address),
    );

    assert.equal(
      await implementationAddress(publicClient, first.address),
      await implementationAddress(publicClient, second.address),
    );
  });

  it("deploys ERC1967 proxies and initializes state", async () => {
    const deployer = await Deployer.default(viem);

    const proxy = await deployer.deployUUPSProxy(
      "DummyProxyImplementation",
      proxyImplementationAbi,
      "initialize",
      ["uups", 33n, walletClients[0].account.address],
    );

    assert.equal(await proxy.read.name(), "uups");
    assert.equal(await proxy.read.amount(), 33n);
    assert.equal(
      getAddress(await proxy.read.owner()),
      getAddress(walletClients[0].account.address),
    );
    assert.equal(await proxy.read.initialized(), true);
    assert.notEqual(
      await implementationAddress(publicClient, proxy.address),
      ZERO_ADDRESS,
    );
  });
});

async function implementationAddress(
  publicClient: MinimalPublicClient,
  proxyAddress: Address,
): Promise<Address> {
  const raw = await publicClient.getStorageAt({
    address: proxyAddress,
    slot: IMPLEMENTATION_SLOT,
  });

  if (raw === undefined) {
    throw new Error("Missing implementation slot value");
  }

  return getAddress(sliceHex(raw, 12));
}

const proxyImplementationAbi = [
  {
    type: "function",
    name: "initialize",
    stateMutability: "nonpayable",
    inputs: [
      { name: "initialName", type: "string" },
      { name: "initialAmount", type: "uint256" },
      { name: "initialOwner", type: "address" },
    ],
    outputs: [],
  },
] as const;
