const { expect, assert } = require("chai");
const hre = require("hardhat");

const { POOL_ADDRESS_PROVIDER } = require("../config");

async function main() {
  console.log("Starting flash loan example")

  const FlashLoanExample = await hre.ethers.getContractFactory(
    "FlashLoanExample"
  );

  // Deploy our FlashLoanExample smart contract
  const flashLoanExample = await FlashLoanExample.deploy(
    // Address of the PoolAddressProvider: you can find it here: https://docs.aave.com/developers/deployed-contracts/v3-mainnet/polygon
    POOL_ADDRESS_PROVIDER
  );
  await flashLoanExample.waitForDeployment().then(  console.log("Contract Deployed"));

 


}

main()