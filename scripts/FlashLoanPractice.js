const { expect, assert } = require("chai");
const { ethers } = require("ethers");
const hre = require("hardhat");

require('dotenv').config()
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const MAINNET_URL = process.env.MAINNET_URL
//const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);

const { POOL_ADDRESS_PROVIDER } = require("../config");
const owner = "0x0040DEf8786BE2f596E9b74d50Ae3eC4A3bFa446"
const apeRouter ="0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607"
const sushiRouter ="0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
const token0 = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" //USDC
const token1 ="0x6cf8654e85ab489ca7e70189046d507eba233613" //USDT

async function main() {
  console.log("Starting flash loan example")

  const FlashLoanExample = await hre.ethers.getContractFactory(
    "FlashLoanSwapTest"
  );

  // Deploy our FlashLoanExample smart contract
  try{
    const flashLoanExample = await FlashLoanExample.deploy(
      // Address of the PoolAddressProvider: you can find it here: https://docs.aave.com/developers/deployed-contracts/v3-mainnet/polygon
      POOL_ADDRESS_PROVIDER,
      apeRouter,
      sushiRouter,
      token0,
      token1
  
    );
    await flashLoanExample.waitForDeployment();

  }catch(err){
    console.log(err)
    console.log("deployment failed due to error")

  }
  
  //do not deploy the contract each time you need to use it.
  //instead deploy in a separate script then call it from the abi after deployment
  //you can even write a separate script for these separate steps later
    
  //everything up to here is just deployment 
  //this is why we add the pool address provider to the contract on init but not the token so we can reuse it for other tokens 

  // Fetch the DAI smart contract - get instance of DIA deployed on Polygon

  const { _TOKEN, _TOKEN_WHALE} = getTokenData()
  
  const token = await hre.ethers.getContractAt("IERC20", token0); //get contract allows you to get the contract even if you aren't signed into your provider
  


  // Move 2000 DAI from DAI_WHALE to our contract by impersonating them
  //this is unrelated to the flash loan itself but helps us pay back the premium
  //irl this would just come from the arbitrage itself
  const BALANCE_AMOUNT = hre.ethers.parseEther("2000");
  /*
  Don't worry about returning if it reverts 
  try{
    
    const signer = await ethers.getImpersonatedSigner(_TOKEN_WHALE);
    await token
      .connect(signer)
      .transfer(flashLoanExample.target, BALANCE_AMOUNT); // Sends our contract 2000 DAI from the DAI_WHALE

  }catch(err){
      console.log("Not enough to borrow")
      console.log(err)
  }*/
  

  // Request and execute a flash loan of 10,000 DAI from Aave
  try{
  const txn = await flashLoanExample.createFlashLoan(_TOKEN, 10000);
  await txn.wait();
  }catch(err){
    console.log(err)
    console.log("transaction reverted due to reason")
  }

  // By this point, we should have executed the flash loan and paid back (10,000 + premium) DAI to Aave
  // Let's check our contract's remaining DAI balance to see how much it has left
  const remainingBalance = await token.balanceOf(flashLoanExample.target);
  console.log(remainingBalance)


  try{
    const txn = await flashLoanExample.withdraw(withdraw, remainingBalance);
    await txn.wait();
    }catch(err){
      console.log(err)
      console.log("transaction reverted due to reason")
    }

  // Our remaining balance should be <2000 DAI we originally had, because we had to pay the premium
  //expect(remainingBalance).to.lessThan(BALANCE_AMOUNT_DAI);
  /*
  if(remainingBalance < BALANCE_AMOUNT ){
    console.log(remainingBalance)
    console.log(BALANCE_AMOUNT)
    console.log("success")

    //withdraw it's checking balance of contract because you don't have a wallet attached !!!!!!

  }else if(remainingBalance == BALANCE_AMOUNT){
    console.log(remainingBalance)
    console.log(BALANCE_AMOUNT)
    console.log("no swap revert")

  }
  else{
    console.log(remainingBalance)
    console.log(BALANCE_AMOUNT)
    console.log("something went wrong")
  }*/
  

}


function getTokenData(){
  //const _TOKEN = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"; //DAI
  //onst _TOKEN_WHALE = "0xdfD74E3752c187c4BA899756238C76cbEEfa954B";

  const _TOKEN_USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; //USDC
  const _TOKEN_WHALE_USDC = "0x6E787903b5f8F610E1A098537E5D16a841D82594";//USDC Whale - general whale wallet

  const _TOKEN_USDT = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"; //USDT
  const _TOKEN_WHALE_USDT = "0x6E787903b5f8F610E1A098537E5D16a841D82594";//USDC Whale - general whale wallet

  const _TOKEN = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
  const _TOKEN_WHALE= "0x05bfe97bf794a4db69d3059091f064ea0a5e538e";//MATIC Whale - general whale wallet
  

  return {_TOKEN, _TOKEN_WHALE}
}

main()
//npx hardhat run --network hardhat scripts/FlashLoanInputTokens.js