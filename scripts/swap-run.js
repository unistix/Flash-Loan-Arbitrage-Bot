const { expect, assert } = require("chai");
const hre = require("hardhat");
const {ethers} = require("ethers")
const v2PairArtifact = require('@uniswap/v2-periphery/build/IUniswapV2Pair.json')
const { POOL_ADDRESS_PROVIDER } = require("../config");
const pools = require('../data/pools.json')


const INFURA_URL = process.env.INFURA_URL



const owner = "0x0040DEf8786BE2f596E9b74d50Ae3eC4A3bFa446"
const router0 ="0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506" //sushirouter --swap these and try again no revert error 
const router1 = "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607" //aperouter
//const router1 = "0xaD340d0CD0B117B0140671E7cB39770e7675C848" //honeyrouter
const token0 = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" //MATIC
//const token1 ="0x2791bca1f2de4661ed88a30c99a7a9449aa84174" //USDC
//const token1 ="0x8f3cf7ad23cd3cadbd9735aff958023239c6a063" //DAI
const token1 ="0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39" //LINK

const flashLoanContractAdress = "0xb873d1C35CF639552c36670c277389d665944867"
const poolNumber = 51 //DAI //51  USDT 41
const BORROW = 1

sqrtToPrice = (sqrt) => {
  /**
   * This function converts the square root of 
   * a Uniswap pair price into the actual price. 
   * It is used in the code to calculate token prices.
   */
  const numerator = sqrt ** 2
  const denominator = 2 ** 192
  let ratio = numerator / denominator
  const decimalShift = Math.pow(10, -12)
  ratio = ratio * decimalShift
  return ratio
}


function convertToContractValue(value, decimals) {
  /**
   * Converts a value to the equivalent value in the smart contract's base unit. 
   */


  // Check if the value is a string or number
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

async function runFlash(_params) {
  console.log("Starting running flash loan contract ")
  console.log("Debug 1")
  console.log(_params.token0)



  const tokenContract0 = await hre.ethers.getContractAt("IERC20", _params.token0)
  console.log("Debug 2")
  const tokenContract1 = await hre.ethers.getContractAt("IERC20", _params.token1)
  const flashLoanContract = await hre.ethers.getContractAt("FlashLoanSwapTest", flashLoanContractAdress)

  const flashContractBalance0 = await tokenContract0.balanceOf(flashLoanContractAdress);
  const flashContractBalance1 = await tokenContract1.balanceOf(flashLoanContractAdress);
  const ownerContractBalance0 = await tokenContract0.balanceOf(owner);
  const ownerContractBalance1 = await tokenContract1.balanceOf(owner);
  const tokenDecimals0 = tokenContract0.decimals() //these will be passed in with the address and symbol
  const tokenDecimals1 = tokenContract1.decimals() //these will be passed in with the address and symbol

 

  //original balance
  console.log("flash loan contract address:",flashLoanContractAdress)
  console.log("flash loan contract balance token0:",hre.ethers.formatUnits(String(flashContractBalance0),tokenDecimals0))
  console.log("flash loan contract balance token1:",flashContractBalance1)

  console.log("owner wallet address:",owner)
  console.log("owner wallet balance token0:", hre.ethers.formatUnits(String(ownerContractBalance0),tokenDecimals0) ) //make sure to get the decimals for the contract for easy reading
  console.log("owner wallet contract balance token1:", hre.ethers.formatUnits(String(ownerContractBalance1),tokenDecimals1))

  console.log(convertToContractValue(1, 18))
  console.log("Debug Running?")


  try{
    
  
    const txn = await flashLoanContract.getERC20Balance(_params.token0); 
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
  
  let abiCoder = ethers.AbiCoder.defaultAbiCoder()

  const params = abiCoder.encode(["address","address","address","address"],[_params.token0,_params.token1,_params.router0,_params.router1])

  try{
    const txn = await flashLoanContract.createFlashLoan(token0, convertToContractValue(BORROW, 18),params); //FIXME:change to decimals
    console.log(txn)
    await txn.wait();

    console.log("transaction complete")
    console.log(txn.hash)
    const balance = await flashLoanContract.getERC20Balance("0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270");
    console.log(hre.ethers.formatUnits(String(balance),tokenDecimals0))
    
    }catch(err){
      console.log(err)
     
      //FIXME:ProviderError: execution reverted: UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT
      //https://ethereum.stackexchange.com/questions/84668/swap-tokens-back-to-ether-on-uniswap-v2-router-02-sell-tokens
    
    }




}

/*
*Calculates the price ratio between tokens based on input and output amounts for token0.
*Calculates the price ratio between tokens based on input and output amounts for token1.
*/
ratio0ToPrice = (amount0In, amount1Out) => 1/(Number(amount0In)/Number(amount1Out)/10**12)
ratio1ToPrice = (amount1In, amount0Out) => Number(amount1In)/Number(amount0Out)*10**12

const provider = new ethers.providers.JsonRpcProvider(INFURA_URL)


let pool1 = pools[poolNumber].pool.id
let pool2 = pools[poolNumber].matches[0].id
const pairA = new ethers.Contract(pool1, v2PairArtifact.abi, provider)
const pairB = new ethers.Contract(pool2, v2PairArtifact.abi, provider)


console.log("listening for swap")
console.log(pool1,pool2)

let ratioTrackingValue; //this value allows you to track the price increase between exchanges
let rTVTempA = 0 //temporary for ExchangeA
let rTVTempB = 0 //tempotary for ExchangeB
let rTVPriceAt0 = 0;
let rTVPriceAt1 = 0;
let rTVPriceBt0 = 0;
let rTVPriceBt1 = 0;
let oppFound = false //if A>B or if B<A 

/**
 * calculate srepead
 * if A>B then run arbitrage sell on A and buy on B
 */

/**
 * calculate spread
 * if B>A then run arbitrage sell on A and buy on buy
 */

const swapEventHandlerA = (sender, amount0In, amount1In, amount0Out, amount1Out, to) => {
  let currentDate = new Date();
  let r0 =ratio0ToPrice(amount0In, amount1Out)
  let r1 =ratio1ToPrice(amount1In, amount0Out)
  
  
  console.log(
    '\nPool A', '|',
    'pair:', pools[poolNumber].pool.name, '|',
    'sender:', sender, '|',
    'ratio0:', r0,
    'ratio1:', r1,
    'time',currentDate
  );

  if(Number.isNaN(r0)){
    rTVPriceAt1 = r1

  }else if(Number.isNaN(r1)){
    rTVPriceAt0 = r0
  }
  if((rTVPriceAt0 !==0 && rTVPriceBt0!==0) || (rTVPriceAt1 !==0 && rTVPriceBt1!==0) ){
    console.log("\nPrices are not zero")
    console.log(rTVPriceAt0)
    console.log(rTVPriceAt1)
    console.log(rTVPriceBt0)
    console.log(rTVPriceBt1)
    console.log("FLASHSWAP?");
    console.log("router0", router0);
    console.log("router1", router1);
    console.log("token0", pools[poolNumber].pool.inputTokens[0].id);
    console.log("token1", pools[poolNumber].pool.inputTokens[1].id);
    

    if(rTVPriceAt0>rTVPriceBt0){
      let spread = rTVPriceAt0 - rTVPriceBt0
      let spreadWFee = spread + (spread*0.005)
      console.log("\nFLASHSWAP A -> B");
      console.log("depending on spread")

      console.log("spread",spread)
      console.log("spread with Fee",spreadWFee)

      if(spreadWFee>0){
        console.log("\n!!FLASHSWAP A -> B!!");
        _params = {token0:pools[poolNumber].pool.inputTokens[0].id,token1:pools[poolNumber].pool.inputTokens[1].id,router0:router0,router1:router1}
       
        pairA.removeListener('Swap', swapEventHandlerA);
        pairB.removeListener('Swap', swapEventHandlerB);
        console.log("stop listening on pool A")
        runFlash(_params)
      }

    }else if(rTVPriceAt0<rTVPriceBt0){
      let spread = rTVPriceAt0 - rTVPriceBt0
      let spreadWFee = spread + (spread*0.005)
      
      console.log("depending on spread")
      console.log("spread",spread)
      console.log("spread with Fee",spreadWFee)

      if(spreadWFee>0){
        console.log("\n!!FLASHSWAP B -> A!!");
        _params = {token0:pools[poolNumber].pool.inputTokens[0].id,token1:pools[poolNumber].pool.inputTokens[1].id,router0:router1,router1:router0}
        
        pairA.removeListener('Swap', swapEventHandlerA);
        pairB.removeListener('Swap', swapEventHandlerB);
        console.log("stop listening on pool A")
        runFlash(_params)
      }

    }else if (rTVPriceAt0 ==0 || rTVPriceBt0==0){
      console.log("\nDON'T SWAP - zero values for t0 ");

    }else{
      console.log("\nDON'T SWAP -Something else wrong")
    }
  }else{
    console.log("\nDON'T SWAP - not enough data");
    //token0of A or B is not pulled yet

  }

  
  
  ++rTVTempA
  console.log(rTVTempA)
  if (rTVTempA===5) {
      pairA.removeListener('Swap', swapEventHandlerA);
      console.log("stop listening on pool A")
      // or
      // sushiPair.off('Swap', sushiSwapEventHandler);
    }

  /**
   * Ratios are great, but also seeing if the amount bought is over a certain value helps too
   */
};

// Start the event listener for Sushi pair and store the reference
const swapEventListenerA = pairA.on('Swap', swapEventHandlerA);

// Define the event handler function for Ape pair
const swapEventHandlerB = (sender, amount0In, amount1In, amount0Out, amount1Out, to) => {
  const currentDate = new Date();
  let r0 =ratio0ToPrice(amount0In, amount1Out)
  let r1 =ratio1ToPrice(amount1In, amount0Out)
  console.log(
    '\nPool B', '|',
    'pair:', pools[poolNumber].matches[0].name, '|',
    'sender:', sender, '|',
    'ratio0:', r0,
    'ratio1:', r1,
    'time',currentDate
  );
    /**
     * Check token t0 and t1
     */
    if(Number.isNaN(r0)){
      rTVPriceBt1 = r1
  
    }else if(Number.isNaN(r1)){
      rTVPriceBt0 = r0
    }
    if((rTVPriceAt0 !==0 && rTVPriceBt0!==0) || (rTVPriceAt1 !==0 && rTVPriceBt1!==0) ){
      console.log("\n Prices are not zero")
      console.log(rTVPriceAt0)
      console.log(rTVPriceAt1)
      console.log(rTVPriceBt0)
      console.log(rTVPriceBt1)
      console.log("FLASHSWAP?");
      console.log("router0", router0); // only need to invert if ape is higher
      console.log("router1", router1);
      console.log("token0", pools[poolNumber].pool.inputTokens[0].id);
      console.log("token1", pools[poolNumber].pool.inputTokens[1].id);

      if(rTVPriceAt0>rTVPriceBt0){
        let spread = rTVPriceAt0 - rTVPriceBt0
        let spreadWFee = spread + (spread*0.005)
        console.log("\nFLASHSWAP A -> B");
        console.log("depending on spread")
        
        
        console.log("spread",spread)
        console.log("spread with Fee",spreadWFee)
        if(spreadWFee>0){
          console.log("\n!!FLASHSWAP A -> B!!");
          _params = {token0:pools[poolNumber].pool.inputTokens[0].id,token1:pools[poolNumber].pool.inputTokens[1].id,router0:router0,router1:router1}
          
          pairA.removeListener('Swap', swapEventHandlerA);
          pairB.removeListener('Swap', swapEventHandlerB);
          console.log("stop listening")
          runFlash(_params)
        }
  
      }else if(rTVPriceAt0<rTVPriceBt0){
        let spread = rTVPriceAt0 - rTVPriceBt0
        let spreadWFee = spread + (spread*0.005)
        console.log("\nFLASHSWAP B -> A");
        console.log("depending on spread")
        console.log("spread",spread)
        console.log("spread with Fee",spreadWFee)
        if(spreadWFee>0){
          console.log("\n!!FLASHSWAP B -> A!!");
          _params = {token0:pools[poolNumber].pool.inputTokens[0].id,token1:pools[poolNumber].pool.inputTokens[1].id,router0:router1,router1:router0}
          
          pairA.removeListener('Swap', swapEventHandlerA);
          pairB.removeListener('Swap', swapEventHandlerB);
          console.log("stop listening")
          runFlash(_params)
        }
  
      }
    }else{
      console.log("DON'T SWAP - not enough data");
  
    }

  

  ++rTVTempB
  console.log(rTVTempB)
  if (rTVTempB===5) {
    pairB.removeListener('Swap', swapEventHandlerB);
    console.log("stop listening on B")
    // or
    // sushiPair.off('Swap', sushiSwapEventHandler);
  }
};

// Start the event listener for Ape pair and store the reference
const swapEventListenerB = pairB.on('Swap', swapEventHandlerB);
/*
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
  //flashLoanExample.target address after deployment*

  const tokenContract0 = await hre.ethers.getContractAt("IERC20", token0)
  const tokenContract1 = await hre.ethers.getContractAt("IERC20", token1)
  const flashLoanContract = await hre.ethers.getContractAt("FlashLoanSwapTest", flashLoanContractAdress)

  const flashContractBalance0 = await tokenContract0.balanceOf(flashLoanContractAdress);
  const flashContractBalance1 = await tokenContract1.balanceOf(flashLoanContractAdress);
  const ownerContractBalance0 = await tokenContract0.balanceOf(owner);
  const ownerContractBalance1 = await tokenContract1.balanceOf(owner);
  const tokenDecimals0 = 18 //these will be passed in with the address and symbol
  const tokenDecimals1 = 18 //these will be passed in with the address and symbol

 

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
    }*
   
    
  //FIXME: run flashloan 
  
  let abiCoder = ethers.AbiCoder.defaultAbiCoder()

  const params = abiCoder.encode(["address","address","address","address"],[token0,token1,router0,router1])

  try{
    const txn = await flashLoanContract.createFlashLoan(token0, convertToContractValue(BORROW, 18),params); 
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

*/
//main()
//0xb873d1C35CF639552c36670c277389d665944867