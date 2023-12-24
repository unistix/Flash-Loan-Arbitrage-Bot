const { expect, assert } = require("chai");
const hre = require("hardhat");
const {ethers} = require("hardhat")



const { POOL_ADDRESS_PROVIDER } = require("../config");
const owner = "0x0040DEf8786BE2f596E9b74d50Ae3eC4A3bFa446"
const router1 ="0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506" //sushirouter --swap these and try again no revert error 
const router0 = "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607" //aperouter
//const router1 = "0xaD340d0CD0B117B0140671E7cB39770e7675C848" //honeyrouter
const token0 = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" //MATIC
//const token1 ="0x2791bca1f2de4661ed88a30c99a7a9449aa84174" //USDC
//const token1 ="0x8f3cf7ad23cd3cadbd9735aff958023239c6a063" //DAI
const token1 ="0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39" //LINK

const flashLoanContractAdress = "0xb873d1C35CF639552c36670c277389d665944867"


function convertToContractValue(value, decimals) {
  // Check if the value is a string or number
  /*if (value<1){
    throw new Error('Cant be less than one');

  }*/
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error('Invalid input: value must be a string or number');
  }

  // Check if decimals is a positive integer
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error('Invalid input: decimals must be a non-negative integer');
  }

  // Convert the value to a BigNumber
  //const valueInBigNumber = ethers.toBigInt(value);

  // Convert the value to the base unit used by the smart contract
  const contractValue = ethers.parseUnits(value.toString(), decimals);

  return contractValue;
}

async function main() {
  console.log("Starting running flash loan contract ")


  /*
  const FlashLoanExample = await hre.ethers.getContractFactory(
    "FlashLoanSwapTest"
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
  //flashLoanExample.target address after deployment*/

  const tokenContract0 = await hre.ethers.getContractAt("IERC20", token0)
  const tokenContract1 = await hre.ethers.getContractAt("IERC20", token1)
  const flashLoanContract = await hre.ethers.getContractAt("FlashLoanSwapTest", flashLoanContractAdress)

  const flashContractBalance0 = await tokenContract0.balanceOf(flashLoanContractAdress);
  const flashContractBalance1 = await tokenContract1.balanceOf(flashLoanContractAdress);
  const ownerContractBalance0 = await tokenContract0.balanceOf(owner);
  const ownerContractBalance1 = await tokenContract1.balanceOf(owner);
  const tokenDecimals0 = 18 //these will be passed in with the address and symbol
  const tokenDecimals1 = 18 //these will be passed in with the address and symbol

  let abiCoder = ethers.AbiCoder.defaultAbiCoder()

  const params = abiCoder.encode(["address","address","address","address"],[token0,token1,router0,router1])

  //original balance
  console.log("flash loan contract address:",flashLoanContractAdress)
  console.log("flash loan contract balance token0:",hre.ethers.formatUnits(String(flashContractBalance0),tokenDecimals0))
  console.log("flash loan contract balance token1:",flashContractBalance1)

  console.log("owner wallet address:",owner)
  console.log("owner wallet balance token0:", hre.ethers.formatUnits(String(ownerContractBalance0),tokenDecimals0) ) //make sure to get the decimals for the contract for easy reading
  console.log("owner wallet contract balance token1:", hre.ethers.formatUnits(String(ownerContractBalance1),tokenDecimals1))

  console.log(convertToContractValue(1, 18))


  try{
    const txn = await flashLoanContract.getERC20Balance("0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"); 
    console.log(txn)
   
    
    }catch(err){
      console.log(err)
      //make arbitrage and create flash loan might be the main issue here.
    }
  //FIXME: the original contract has the deposit and approval steps outside hence why it worked but actually it should be within the contract and called during run

    
  //TODO:trasfer token (may not need to adjust smart contract) - you may need to rewrite smart contract to recieve balance if this doesn't work
  //https://stackoverflow.com/questions/71759637/how-do-i-transfer-erc20-tokens-using-ether-js
  //https://www.0xdev.co/how-to-send-erc-20-tokens-transactions-using-ethers-js-and-javascript/

  //FIXME: figure out correct withdraw amount value 
  //hre.ethers.formatUnits(String(ownerContractBalance0) reverse this
  //this will also help you figure out how to input the correct borrow amount
    
  /*try{
    const txn = await flashLoanContract.withdraw(convertToContractValue(0.1, 18),"0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"); 
    console.log(txn)
   
    
    }catch(err){
      console.log(err)
      //make arbitrage and create flash loan might be the main issue here.
    }*/
   
    
  //FIXME: run flashloan 
  


  try{
    const txn = await flashLoanContract.createFlashLoan(token0, convertToContractValue(10, 18),params); 
    console.log(txn)
    await txn.wait();

    console.log("transacation complete")
    console.log(txn.hash)
    const balance = await flashLoanContract.getERC20Balance("0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270");
    console.log(hre.ethers.formatUnits(String(balance),tokenDecimals0))
    
    }catch(err){
      console.log(err)
     
      //FIXME:ProviderError: execution reverted: UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT
      //https://ethereum.stackexchange.com/questions/84668/swap-tokens-back-to-ether-on-uniswap-v2-router-02-sell-tokens
    
    }




}

main()
//0xb873d1C35CF639552c36670c277389d665944867