const {ethers} = require("ethers") //don't need ha
const v2PairArtifact = require('@uniswap/v2-periphery/build/IUniswapV2Pair.json')
const { POOL_ADDRESS_PROVIDER } = require("../config");
const pools = require('../data/pools.json')

const INFURA_URL = process.env.INFURA_URL
const owner = "0x0040DEf8786BE2f596E9b74d50Ae3eC4A3bFa446"
const flashLoanContractAdress = "0xb873d1C35CF639552c36670c277389d665944867"