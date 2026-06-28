// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DummyDirectDeployment {
  string public name;
  uint256 public amount;
  address public owner;
  address public constructorSender;

  constructor(string memory constructorName, uint256 constructorAmount) {
    name = constructorName;
    amount = constructorAmount;
    owner = msg.sender;
    constructorSender = msg.sender;
  }
}
