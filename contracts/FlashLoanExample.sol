// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//Since we are not actually executing any arbitrage, and therefore will not be able to pay the premium if we run the contract as-is

contract FlashLoanExample is FlashLoanSimpleReceiverBase { //base contract which we will inherit from 
    event Log(address asset, uint256 val);
    
    
    //Pass constructor details to the provider 
    constructor(IPoolAddressesProvider provider) 
        FlashLoanSimpleReceiverBase(provider)
    {} //this is the pool address wrapped around the interface that the token will be borrowing from 
    //plural so ideally multiple addresses can be provided 

    function createFlashLoan(address asset, uint256 amount, bytes memory params) external { //pass params in here!!!!!
        //takes asset and amount from the user for which to start the flash loan
        address receiver = address(this); //specify address for flashloan example contract Receiver must approve the Pool contract for at least the amount borrowed + fee, else transaction will revert.
        uint16 referralCode = 0;
        //why do we not set on behalf of here?
        POOL.flashLoanSimple(receiver, asset, amount, params, referralCode); //flashloan simple works for single however for multiple pools, flashloan() works 
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        // do things like arbitrage here 
        // abi.decode(params) to decode params

        uint256 amountOwing = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwing); //approve the asset being spent

        //two contracts 
        //one swaps one way 
        //one swap the other way

        //https://github.com/kaymen99/aave-flashloan-arbitrage/blob/main/contracts/FlashLoanArbitrage.sol
        //makeArbitrage()
        //Swap()



        //SWAP


        //log completion
        emit Log(asset, amountOwing);
        return true;
    }
}