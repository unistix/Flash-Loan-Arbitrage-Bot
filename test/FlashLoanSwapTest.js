const { expect, assert } = require("chai");
const hre = require("hardhat");
const web3 = require('web3')

//const { DAI, DAI_WHALE, POOL_ADDRESS_PROVIDER } = require("../config");

const { POOL_ADDRESS_PROVIDER } = require("../config");
const owner = "0x0040DEf8786BE2f596E9b74d50Ae3eC4A3bFa446"
const router0 ="0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607" //aperouter
const router1 ="0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506" //sushirouter
const token0 = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" //MATIC
const token1 ="0xbbba073c31bf03b8acf7c28ef0738decf3695683" //SAND

describe("Flash Loans", function () { //describe is a testing convention from chai it allows the user to specify the goal of a test using it 
  it("Should deploy the flash swap contract and run a test swap", async function () {
    const FlashLoanExample = await hre.ethers.getContractFactory(
      "FlashLoanSwapTest"
    );

    // Deploy our FlashLoanExample smart contract
    const flashLoanExample = await FlashLoanExample.deploy(
      // Address of the PoolAddressProvider: you can find it here: https://docs.aave.com/developers/deployed-contracts/v3-mainnet/polygon
      POOL_ADDRESS_PROVIDER
      
    );
    //the constructor is not the issue.
    await flashLoanExample.waitForDeployment();
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




    console.log("owner wallet address:",owner)
    console.log("owner wallet balance token0:", hre.ethers.formatUnits(String(ownerContractBalance0),tokenDecimals0) ) //make sure to get the decimals for the contract for easy reading
    console.log("owner wallet contract balance token1:", hre.ethers.formatUnits(String(ownerContractBalance1),tokenDecimals1))

 
   // let _params = {token0:token0 , token1:token1, routerAddress0: sushiRouter, routerAddress1: apeRouter} //{address token0; address token1;address routerAddress0; address routerAddress1; }
   
    
    //get params from subgraph data 
    //const params = [token0,token1,sushiRouter,apeRouter]
    //hre.ethers.utils.defaultAbiCoder.encode(
    /*const encoded_params = web3.eth.abi.encodeParameters(
        ['address[]'],
        [params]
      )*/

    let abiCoder = hre.ethers.utils.defaultAbiCoder

    const params = abiCoder.encode([address,address,address,address],[token0,token1,router0,router1])


    try{
      const txn = await flashLoanExample.createFlashLoan(token0, 10000,params); 
      console.log(txn)
      await txn.wait();
      
      }catch(err){
        console.log(err)
       
        
        //make arbitrage and create flash loan might be the main issue here.
      }

    //remaining balance
    const rflashContractBalance0 = await tokenContract0.balanceOf(flashLoanExample.target);
    const rflashContractBalance1 = await tokenContract1.balanceOf(flashLoanExample.target);
    console.log("flash loan contract address:",flashLoanExample.target)
    console.log("flash loan contract remaining balance token0:",rflashContractBalance0)
    console.log("flash loan contract remaining balance token1:",rflashContractBalance1)


    //everything up to here is just deployment 
    //this is why we add the pool address provider to the contract on init but not the token so we can reuse it for other tokens 

    
  });
});

//npx hardhat test
