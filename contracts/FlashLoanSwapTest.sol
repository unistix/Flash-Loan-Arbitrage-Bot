// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "../interfaces/IUniswapV2Router02.sol"; //import actual interface
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//Since we are not actually executing any arbitrage, and therefore will not be able to pay the premium if we run the contract as-is
//https://github.com/kaymen99/aave-flashloan-arbitrage/blob/main/contracts/FlashLoanArbitrage.sol

contract FlashLoanSwapTest is FlashLoanSimpleReceiverBase { //base contract which we will inherit from 
   
   
   
    /**
     * pass in params (router and addresses to create flashloan)
     * rewrite createflashloan functions to only swap after make arbirtage with values from params
     * you only need swap function and params
     * uniswap V3 example covers passing them in
     * 
     * Routers also get passed in as params so switch to router 1 and router 2
     */
    address public owner;
   

    enum Exchange {
        UNI,
        SUSHI,
        NONE
    }

    //--------------------------------------------------------------------
    // MODIFIERS

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can call this");
        _;
    }


    event Log(address asset, uint256 val);


    

    constructor(
        IPoolAddressesProvider provider
    
    
    )
        FlashLoanSimpleReceiverBase(provider)
    {
      
        owner = msg.sender;
    
    } //this is the pool address wrapped around the interface that the token will be borrowing from 
    //plural so ideally multiple addresses can be provided 
    function getERC20Balance(address _erc20Address)
        public
        view
        returns (uint256)
    {
        //returns the balance held in this contract for performing operations
        return IERC20(_erc20Address).balanceOf(address(this));
    }

   

    function _getPrice(
        address routerAddress,
        address sell_token,
        address buy_token,
        uint256 amount
    ) internal view returns (uint256) {
        address[] memory pairs = new address[](2);
        pairs[0] = sell_token;
        pairs[1] = buy_token;
        uint256 price = IUniswapV2Router02(routerAddress).getAmountsOut(
            amount,
            pairs
        )[1];
        return price;
    }

    

    function _swap(
        uint256 amountIn,
        address routerAddress,
        address sell_token,
        address buy_token
    ) internal returns (uint256) {
        IERC20(sell_token).approve(routerAddress, amountIn);

        uint256 amountOutMin = (_getPrice(
            routerAddress,
            sell_token,
            buy_token,
            amountIn
        ) * 95) / 100;

        address[] memory path = new address[](2);
        path[0] = sell_token;
        path[1] = buy_token;

        uint256 amountOut = IUniswapV2Router02(routerAddress)
            .swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                address(this),
                block.timestamp
            )[1];
        return amountOut;
    }

    function makeArbitrage(uint256 amount, address token0, address token1, address router0, address router1) public { //could be worth passing in variables here
       

        
            //pass in flashparams list values and amount to get amount out 
            uint256 amountOut = _swap( 
                amount,
                router0,
                token0,
                token1
            );

            _swap(amountOut, router1, token1,token0);
        
    }
    


    function createFlashLoan(address asset, uint256 amount, bytes memory params ) external { //pass params in here!!!!!
        //takes asset and amount from the user for which to start the flash loan
        address receiver = address(this); //specify address for flashloan example contract Receiver must approve the Pool contract for at least the amount borrowed + fee, else transaction will revert.
        // use this to pass arbitrary data to executeOperation - this is the issue you aren't actually passing in any params all the stuff passed into uniswap should be pased into params
        uint16 referralCode = 0;
        //why do we not set on behalf of here?
        POOL.flashLoanSimple(receiver, asset, amount, params, referralCode); //flashloan simple works for single however for multiple pools, flashloan() works 
        //
    }

    function withdraw(uint256 amount,address tokenAddress0) public onlyOwner {
        //withdraw funds from the contract to owner address

        uint256 tokenBalance0 = getERC20Balance(tokenAddress0); 

        require(amount <= tokenBalance0, "Not enough amount deposited");
        IERC20(tokenAddress0).transferFrom(address(this), msg.sender, amount);
    }


    //get price
    
    //_swap

    /*
      struct FlashParams {
        address token0; 
        address token1;
        address routerAddress0; //initial router address
        address routerAddress1; //revert router address router address
    
    } */
  

    

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params //list of addresses to be passed in 
    ) external returns (bool) {
        // do things like arbitrage here 
        // abi.decode(params) to decode params
       
        
        
        (address token0, address token1, address router0, address router1) = abi.decode(params, (address, address, address, address));  //params = [token0,token1,router0,router1]


        //SWAP
        makeArbitrage(amount,token0,token1,router0,router1);//you haven't actuall pass anything from params into here

        //RETURN MONEY
        uint256 amountOwing = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwing); //approve the asset being spent

        //need to withdraw here after the amount owed is return 
        //what's left incontract tbh

        //log completion
        emit Log(asset, amountOwing);
        return true;
    }
}