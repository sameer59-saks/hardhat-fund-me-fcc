//helper config
const networkConfig = {
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    1337: {
        name: "localhost",
    },
}

const developmentChains = ["hardhat", "localhost"]

const DECIMALS = 8
const INITIAL_PRICE = 200000000000 // 2000

//for  other scripts  to use it
module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
}