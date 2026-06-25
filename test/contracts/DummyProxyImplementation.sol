// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DummyProxyImplementation {
  string public name;
  uint256 public amount;
  address public owner;
  bool public initialized;

  function initialize(
    string memory initialName,
    uint256 initialAmount,
    address initialOwner
  ) external {
    require(!initialized, "already initialized");
    initialized = true;
    name = initialName;
    amount = initialAmount;
    owner = initialOwner;
  }
}
