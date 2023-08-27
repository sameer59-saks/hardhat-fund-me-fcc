//require("@nomiclabs/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers")
    //require("@nomiclabs/hardhat-ethers")
    //require("@nomiclabs/hardhat-chai-matchers")

require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
    //require("./tasks/block-number")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")
require("@nomiclabs/hardhat-waffle")


const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://goerli.infura.io/v3/"
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || "key"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key" //call coinmarketcap api  key for price of gas price


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [GOERLI_PRIVATE_KEY],
            chainId: 5,
            blockConformations: 6,
        },
        /*localhost: {
            url: "http://127.0.0.1:8545",
            accounts: [process.env.PRIVATE_KEY], //local hardhat  auto gives us  accounts
            chainId: 31337,
        },*/
    },
    solidity: {
        compilers: [{
                version: "0.8.8",
            },
            {
                version: "0.6.6",
            },
        ],
    },

    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        token: "ETH",
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
}