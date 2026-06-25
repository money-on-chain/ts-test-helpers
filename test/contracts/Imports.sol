// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ProxyAdmin as OZProxyAdmin } from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import { TransparentUpgradeableProxy as OZTransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import { ERC1967Proxy as OZERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract ProxyAdmin is OZProxyAdmin {}

contract TransparentUpgradeableProxy is OZTransparentUpgradeableProxy {
  constructor(address logic, address admin, bytes memory data) OZTransparentUpgradeableProxy(logic, admin, data) {}
}

contract ERC1967Proxy is OZERC1967Proxy {
  constructor(address logic, bytes memory data) OZERC1967Proxy(logic, data) {}
}
