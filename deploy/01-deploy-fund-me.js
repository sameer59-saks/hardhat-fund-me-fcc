//import
//main functionca
// calling main function

//import
//main function
//calling main function

// async function deployFunc(hre) {

//     console.log("deploy");
//hre.getNamedAccounts
//hre.deployments
// }
// module.exports.default = deployFunc

///  OR

// module.export = async(hre) => {
//     const { getNamedAccounts, deployments } = hre

//OR

//=== === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === ==
/*module.exports = async({
    getNamedAccounts,
    deployments
}) => {
    //funcvtions  deploy and log
    const { deploy, log } = deployments ///get  from  deploymenets objects
    const { deployer } = await getNamedAccounts() // way  to get  named accounts from ether accounts while working ether
    const chainId = network.config.chainId // get the chain information where the contract will be  deployed

    //import  the network config
    //well what happens when we want to change the chains?
    const { networkConfig } = require("../helper-hardhat-config")
        // Select  the chainID to identify which address to use
        //    const ethUSDPriceFeedAddress = networkConfig[chainId]["ethUSDPriceFeed"]
    let etheUSDPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUSDAggregator = await get("MockV3Aggregator");
        etheUSDPriceFeedAddress = ethUSDAggregator.address
    } else {
        ethUSDPriceFeedAddress = networkConfig[chainId]["ethUSDPriceFeed"]
    }

    //when going for local deployment or hardhat network deployment  we want to use mocks.   If contracts does not exist


    //In order for us to deploy contract we  need to  use deploy function
    //name of the  contract fundme/FundME, after that  list of  overrides from and  args
    const fundme = await deploy("FundMe", {
        from: deployer,
        args: [ethUSDPriceFeedAddress],
        log: true, // custom  logging
    })

    console.log("--------------------------------")
}

module.exports = ["all",
        "fundme"
    ] */



//=== === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === === ==

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("./../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const GOERLI_RPC_URL =
    process.env.GOERLI_RPC_URL ||
    "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
const PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    "0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

module.exports = async({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
        //if (chainId == 31337) {
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        //args: [address],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    if (!developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}

module.exports.tags = ["all", "fundme"]