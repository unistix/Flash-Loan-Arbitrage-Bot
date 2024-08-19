const { expect, assert } = require("chai");
const hre = require("hardhat");
const {ethers} = require("hardhat")

//const { DAI, DAI_WHALE, POOL_ADDRESS_PROVIDER } = require("../config");

const { POOL_ADDRESS_PROVIDER } = require("../config");
const owner = "0x0040DEf8786BE2f596E9b74d50Ae3eC4A3bFa446"
const router0 ="0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607" //aperouter
const router1 ="0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506" //sushirouter
const token0 = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" //MATIC
const token1 ="0xbbba073c31bf03b8acf7c28ef0738decf3695683" //SAND

async function main() {
  console.log("Starting flash loan deploy")

  const FlashLoanExample = await hre.ethers.getContractFactory(
    "FlashLoanSlip"
  );

  console.log("debug")

  // Deploy our FlashLoanExample smart contract
  const flashLoanExample = await FlashLoanExample.deploy(
    // Address of the PoolAddressProvider: you can find it here: https://docs.aave.com/developers/deployed-contracts/v3-mainnet/polygon
    POOL_ADDRESS_PROVIDER
    
  );
  //the constructor is not the issue.
  await flashLoanExample.waitForDeployment();

  

// print the address of the deployed contract
  //flashLoanExample.target address after deployment

  const tokenContract0 = await hre.ethers.getContractAt("IERC20", token0)
  const tokenContract1 = await hre.ethers.getContractAt("IERC20", token1)
  const flashContractBalance0 = await tokenContract0.balanceOf(flashLoanExample.target);
  const flashContractBalance1 = await tokenContract1.balanceOf(flashLoanExample.target);
  const ownerContractBalance0 = await tokenContract0.balanceOf(owner);
  const ownerContractBalance1 = await tokenContract1.balanceOf(owner);
  const tokenDecimals0 = 18 //these will be passed in with the address and symbol
  const tokenDecimals1 = 6 //these will be passed in with the address and symbol

  //original balance
  console.log("flash loan contract address:",flashLoanExample.target)
  console.log("flash loan contract balance token0:",flashContractBalance0)
  console.log("flash loan contract balance token1:",flashContractBalance1)
 


}

main()

//0xEC9f0393d6bd0621De4dFC9DcAde437d6446a06A
