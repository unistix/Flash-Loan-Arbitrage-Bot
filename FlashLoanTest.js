const { expect, assert } = require("chai");
const hre = require("hardhat");

const { DAI, DAI_WHALE, POOL_ADDRESS_PROVIDER } = require("../config");

describe("Flash Loans", function () { //describe is a testing convention from chai it allows the user to specify the goal of a test using it 
  it("Should take a test flash loan and be able to return it", async function () {
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

    // Fetch the DAI smart contract - get instance of DIA deployed on Polygon
    const token = await hre.ethers.getContractAt("IERC20", DAI); //get contract allows you to get the contract even if you aren't signed into your provider
    

    // Move 2000 DAI from DAI_WHALE to our contract by impersonating them
    //this is unrelated to the flash loan itself but helps us pay back the premium
    //irl this would just come from the arbitrage itself
    const BALANCE_AMOUNT_DAI = hre.ethers.parseEther("2000");
    const signer = await ethers.getImpersonatedSigner(DAI_WHALE);
    await token
      .connect(signer)
      .transfer(flashLoanExample.target, BALANCE_AMOUNT_DAI); // Sends our contract 2000 DAI from the DAI_WHALE

    // Request and execute a flash loan of 10,000 DAI from Aave
    const txn = await flashLoanExample.createFlashLoan(DAI, 10000);
    await txn.wait();

    // By this point, we should have executed the flash loan and paid back (10,000 + premium) DAI to Aave
    // Let's check our contract's remaining DAI balance to see how much it has left
    const remainingBalance = await token.balanceOf(flashLoanExample.target);

    // Our remaining balance should be <2000 DAI we originally had, because we had to pay the premium
    expect(remainingBalance).to.lessThan(BALANCE_AMOUNT_DAI);
    console.log(remainingBalance)
    console.log(BALANCE_AMOUNT_DAI)
    //checking that the remaining balance of FlashLoanExampleContract is less than the amount it initially started with, 
    //the amount will be less because the contract had to pay a premium on the loaned amount.
  });
});