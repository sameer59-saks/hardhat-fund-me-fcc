// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;


import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {

    //function withdraw(

    //get  the conversion rate  using func

    //get  the price of ETH
    function getPriceFeed(AggregatorV3Interface priceFeed) internal view returns (uint256){
        //ABI : It is different  functions  and properties
        // Address : 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e goerli contract address from docs

       // AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // ETH in  tterms of USD
        // ETH current price 
        //8 deimals associated in priceFeed we need 10 more
        return uint256(price * 1e10);

    }
    //we  eliminated the use of getversion  function for fundme 
   /* function getVersion() internal  view returns (uint256) {
        // with hardhat  fund me we  want  t o avoid  hardcoding  of  addres with v3interface
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        return priceFeed.version();//version of price feed

    }*/

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns (uint256){
        uint256 ethPrice = getPriceFeed(priceFeed);
        uint256 ethAmountInUSD = (ethPrice * ethAmount) / 1e18; //need  to do  this as we do not want to end up with too many 0's

        return ethAmountInUSD;
}

}