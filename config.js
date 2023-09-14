// Polygon Mainnet DAI Contract Address
const DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
// Random user's address that happens to have a lot of DAI on Polygon Mainnet
// By the time you're doing this lesson, if this address doesn't have DAI on Polygon Mainnet,
// switch it out for someone else who does have a lot of DAI
const DAI_WHALE = "0xdfD74E3752c187c4BA899756238C76cbEEfa954B";
//impersonation that lets us send transactions on behalf of any address, using impersontion we will steal some from the DAI_WHALE so we have enough DAI to pay back the loan with premium

// Mainnet Pool contract address
const POOL_ADDRESS_PROVIDER = "0xa97684ead0e402dc232d5a977953df7ecbab3cdb"; //POOL_ADDRESS_PROVIDER is the address of the PoolAddressesProvider on polygon mainnet that our contract is expecting in the constructor.
//You borrow money from the aave pool contract and not the exchange so while you probably need to pool contract for swapping and other important things you don't need for the borrow step

module.exports = {
  DAI,
  DAI_WHALE,
  POOL_ADDRESS_PROVIDER,
};