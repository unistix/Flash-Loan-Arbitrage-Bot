// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FlashLoanTriangle is FlashLoanSimpleReceiverBase {
    address public owner;

    event Log(address asset, uint256 amount);
    event TradeExecuted(string description, uint256 amountOut);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor(address provider) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(provider)) {
        owner = msg.sender;
    }

    function getERC20Balance(address _tokenAddress) public view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }

    function getPrice(
        address _routerAddress,
        address _sellToken,
        address _buyToken,
        uint256 _amount
    ) internal view returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = _sellToken;
        path[1] = _buyToken;
        uint256[] memory amounts = IUniswapV2Router02(_routerAddress).getAmountsOut(_amount, path);
        return amounts[1];
    }

    function swap(
        uint256 _amountIn,
        address _routerAddress,
        address _sellToken,
        address _buyToken
    ) internal returns (uint256) {
        IERC20(_sellToken).approve(_routerAddress, _amountIn);

        uint256 amountOutMin = (getPrice(_routerAddress, _sellToken, _buyToken, _amountIn) * 95) / 100;
        address[] memory path = new address[](2);
        path[0] = _sellToken;
        path[1] = _buyToken;

        uint256[] memory amounts = IUniswapV2Router02(_routerAddress).swapExactTokensForTokens(
            _amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        emit TradeExecuted("Trade executed", amounts[1]);
        return amounts[1];
    }

    function executeArbitrage(address[3] memory _tokens, address[3] memory _routers, uint256 _amount) public  {
        uint256 amountOut1 = swap(_amount, _routers[0], _tokens[0], _tokens[1]);
        uint256 amountOut2 = swap(amountOut1, _routers[1], _tokens[1], _tokens[2]);
        uint256 amountOut3 = swap(amountOut2, _routers[2], _tokens[2], _tokens[0]);

        require(amountOut3 > _amount, "Arbitrage not profitable");
    }

    function createFlashLoan(address _asset, uint256 _amount, bytes memory _params) external  {
        POOL.flashLoanSimple(address(this), _asset, _amount, _params, 0);
    }

    function withdrawERC20(address _tokenAddress, uint256 _amount) public onlyOwner {
        uint256 balance = getERC20Balance(_tokenAddress);
        require(balance >= _amount, "Insufficient balance");
        IERC20(_tokenAddress).transfer(msg.sender, _amount);
        emit Log(_tokenAddress, _amount);
    }

    function executeOperation(
        address _asset,
        uint256 _amount,
        uint256 _premium,
        address _initiator,
        bytes calldata _params
    ) external returns (bool) {
        (address[3] memory tokens, address[3] memory routers) = abi.decode(_params, (address[3], address[3]));

        executeArbitrage(tokens, routers, _amount);

        uint256 amountOwing = _amount + _premium;
        IERC20(_asset).approve(address(POOL), amountOwing);
        return true;
    }
}