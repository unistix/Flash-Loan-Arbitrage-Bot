

require("@nomicfoundation/hardhat-toolbox");

/*require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");*/
require("dotenv").config()

const URL = 

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.10",
  networks: {
    
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: [process.env.WALLET_SECRET]
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
};
