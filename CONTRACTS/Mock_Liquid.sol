//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract MockLiquid is ERC20,Ownable {
    constructor() ERC20("MicroVouchBank", "MVB") Ownable(msg.sender) 
    {
        _mint(msg.sender, 1_000_000 ether);
    }
function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

}

/**
 *   MockLiquid deployed at: 0xa05F1D815AF6d1B903dCFAbA0c35aFee335ff486     
  MockV3Aggregator (UGX/USD) deployed at: 0x107Bf69b56D29dc2aAe430f43C1f155a60e6Eed0
  CoreMicroBank deployed at: 0xa4b19f67D4A9F0b3E3962aC5e9F05cbFA0106A9a 
 * 
 * 
 */