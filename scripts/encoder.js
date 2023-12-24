const { expect, assert } = require("chai");
const hre = require("hardhat");
const {ethers} = require("hardhat")

//const { DAI, DAI_WHALE, POOL_ADDRESS_PROVIDER } = require("../config");

const { POOL_ADDRESS_PROVIDER } = require("../config");
const owner = "0x0040DEf8786BE2f596E9b74d50Ae3eC4A3bFa446"
const router0 ="0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607" //aperouter
const router1 ="0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506" //sushirouter
const token0 = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" //MATIC
const token1 ="0xbbba073c31bf03b8acf7c28ef0738decf3695683" //SAND

async function main() {
    let abiCoder = ethers.AbiCoder.defaultAbiCoder()

    const params = abiCoder.encode(["address","address","address","address"],[token0,token1,router0,router1])

    console.log(params)


}

main()
//0xb873d1C35CF639552c36670c277389d665944867