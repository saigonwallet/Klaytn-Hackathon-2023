// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Hackathon {
  address public owner = msg.sender;
  uint public after_completed_deployment;

  modifier restricted() {
    require(
      msg.sender == owner,
      "This function is restricted to the contract's owner"
    );
    _;
  }

  function whenCompleted(uint completed) public restricted {
    after_completed_deployment = completed;
  }
}