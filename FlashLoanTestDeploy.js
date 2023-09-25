const { expect, assert } = require("chai");
const hre = require("hardhat");

const { DAI, DAI_WHALE, POOL_ADDRESS_PROVIDER } = require("../config");

describe("Flash Loans", function () { //describe is a testing convention from chai it allows the user to specify the goal of a test using it 
  it("Should deploy the example flash loan test contract and nothing else", async function () {
    const FlashLoanExample = await hre.ethers.getContractFactory(
      "FlashLoanExample"
    );

    // Deploy our FlashLoanExample smart contract
    const flashLoanExample = await FlashLoanExample.deploy(
      // Address of the PoolAddressProvider: you can find it here: https://docs.aave.com/developers/deployed-contracts/v3-mainnet/polygon
      POOL_ADDRESS_PROVIDER
    );
    await flashLoanExample.waitForDeployment();


    //everything up to here is just deployment 
    //this is why we add the pool address provider to the contract on init but not the token so we can reuse it for other tokens 

    
  });
});

//npx hardhat test