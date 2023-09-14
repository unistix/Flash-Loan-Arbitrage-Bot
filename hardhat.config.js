/*require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const QUICKNODE_RPC_URL = process.env.MAINNET_URL;

//remember this is a fork of hard hat so when you run the real version change this and eventually find a quicker node


module.exports = {
  solidity: "0.8.10",
  networks: {
    hardhat: {
      forking: {
        url: QUICKNODE_RPC_URL,
      },
    },
  },
};*/


require("@nomicfoundation/hardhat-toolbox");
/*
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");*/
require("dotenv").config()


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.10",
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_URL,
      },
    },

    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: [process.env.WALLET_SECRET]
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
};
