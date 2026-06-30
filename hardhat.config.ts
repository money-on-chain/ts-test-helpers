import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import { defineConfig } from 'hardhat/config';

export default defineConfig({
    plugins: [hardhatToolboxViemPlugin],
    solidity: {
        version: '0.8.24',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
        npmFilesToBuild: [
            '@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol',
            '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol',
            '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol',
        ],
    },
    paths: {
        sources: 'test/contracts',
        artifacts: 'artifacts',
        cache: 'cache',
    },
});
