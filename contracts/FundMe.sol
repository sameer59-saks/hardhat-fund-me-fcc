// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

//Get funds
//Withdraw funds
// Set Min Funding Value
//pragma solidity ^0.8.8;

//imports
import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";
//import {solidity} from "ethereum-waffle";

//Error Codes
error FundMe__NotOwner();

// interfaces, Libraries, Contracts

/** @title A Contract for Crowd Funding
 * @author Sameer Varpe
 * @notice This contract is to demo a sample funding  contract
 * @dev This implements  price feeds as our library
 */
contract FundMe {

    //type declarations 
    using PriceConverter for uint256;

    //constant  keywork reduces the gas cost
    uint256 public constant MINIMUM_USD = 50   * 1e18;//sending  from  outside or  transaction will be  cancelled.
    uint256 cnt = 0;
    //address[] public s_funders;
    address[] private s_funders;//gas  optimizing with private
    //mapping(address => uint256) private s_addressToAmountFunded;
    AggregatorV3Interface private s_priceFeed;
    
    // State variables
    mapping(address=>uint256) public s_addressToAmountFunded;

    //immutable saves more  gas
    address public immutable i_owner;

    //AggregatorV3Interface public priceFeed;

    modifier onlyOwner {
            //require(msg.sender == i_owner, "Sender is not owner");
            if(msg.sender != i_owner) { revert  FundMe__NotOwner();}
            _;
        }


    // functions order
    // Contructor
    //recieve
    //fallback
    //external
    //public
    //internal
    //private
    //view /pure
    





    //called auto when contract is deployed
    //adding parameter  to contructor then we can save  aggregator v3 addterss as a  global var
    /** constructor(address  priceFeedAddres) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddres); //refer to priceconvertor.sol for reference
        //we can take this priceFeedAddres as a global var  and use  it   with priceconvertor
         // with hardhat  fund me we  want  t o avoid  hardcoding  of  addres with v3interface
    }*/

    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
        i_owner = msg.sender;
    }

    /*function fund() public payable{
        //make the function  payable to make it appear for what is doing distinctly shown as  red button. Public  will make it accessible

        //Want  to be able to set min fund amount in USD
        //1. How do we send ETH  to this contract

        //We are able  to access value attribute check  Deploy & Run transaction

        //require // send  2 ETH  min to  fund
        require (getConversionRate(msg.value) >= MINIMUM_USD, "Send Enough ETH");// 1e18 == 1 * 10 * 18 == 1000000000000000000  wei  is 1  ETH 
    }*/

        function fund() public payable {
        //msg.value here is  whatever value it is for ETH or any other cryptocurrency we are interacting with
            require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        //require(getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public  onlyOwner{
        //we are having  to have  a  expensive read  as we are reading  from array which is exxpensive and not efficient way of  doing.
        //require(msg.sender == owner, "Sender is not owner");
        for(uint256 funderIndex = 0; funderIndex < s_funders.length; funderIndex++) {
            console.log("countrer", cnt);
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
            cnt += 1;
        }

        //reset the array
        s_funders = new address[](0);

        //actually withdraw funds
        //call
                           //bytes memory dataReturned is optional     
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "call failed");    

    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;///put entire array  in  memory so can directly read from it to   reduce  gas   price
        // mappings can't be in memory, sorry!
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder =  funders[funderIndex];//resetting funders address
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // payable(msg.sender).transfer(address(this).balance);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    
    }
        // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    
    //This functions  are called if the user  called the wrong function and  we  still  want  to  handle  the  call  data
    //  User w ill lose the moeny  in a normal  scenari, however if  we handle the data  with some  special  function
    // we can still call these special function when user fails tto call the correct one and within those special  function call fund()
    
    /*fallback external payable {  //  if htere is data  associated  with the function  but function itself is  wrong then  fallback is called
        fund();
    }

    receive() external payable { // when there  is  no  data    associated  recieve() gets called
        fund();
    }*/

        /** @notice Gets the amount that an address has funded
     *  @param fundingAddress the address of the funder
     *  @return the amount funded
     */
    function getAddressToAmountFunded(address fundingAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[fundingAddress];
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    
}

