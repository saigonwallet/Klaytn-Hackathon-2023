// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface BsToken {
    function transferFrom(address, address, uint256) external returns (bool);
    function approve(address, uint256) external returns (bool);
    function balanceOf(address) external returns (uint256);
    function totalSupply() external returns (uint256);
}

contract BonsaiDAO {
    struct Proposal {
        string description;
        uint256 yesCount;
        uint256 noCount;
        uint256 timestamp;
    }

}