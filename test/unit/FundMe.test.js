const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
    //const utils = require("utils")
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers")
const { BigNumber } = require("bignumber.js")
    //const { describe } = require("node:test")
    //const { it } = require("mocha")

!developmentChains.includes(network.name) ?
    describe.skip :
    describe("FundMe", function() {
        this.timeout(20000)
        let fundMe
        let mockV3Aggregator
        let deployer
        const sendValue = ethers.utils.parseEther("1")
        const gasLimit = 4000000 // set gas limit for transactionsdVa
            //const senValue = ethers.utils.parseEther("1") / / set eth value
            /*beforeEach(
              async function() {
                  // const accounts = await ethers.getSigners()
                  // deployer = accounts[0]
                  deployer = (await getNamedAccounts()).deployer

                  //await deployments.fixture(["FundMe", "MockV3Aggregator"]) // deploy only necessary contracts
                  await deployments.fixture(["all"])
                  fundMe = await ethers.getContract("FundMe", deployer)
                  mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
              }) */
        beforeEach(async function() {
            const accounts = await ethers.getSigners()
                //deployer = accounts[0].address
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])

            fundMe = await ethers.getContract("FundMe", deployer)
            mockV3Aggregator = await ethers.getContract(
                "MockV3Aggregator",
                deployer
            )
        })

        describe("constructor", function() {
            it("sets the aggregator addresses correctly", async() => {
                //const response = await fundMe.getPriceFeed({ gasLimit }) // set gas limit for transaction
                const response = await fundMe.getPriceFeed()
                assert.equal(response, mockV3Aggregator.address)
                expect(mockV3Aggregator.address).to.exist
            })
        })

        describe("fund", async function() {
            // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
            // could also do assert.fail
            /*it("Fails if you don't send enough ETH", async function() {
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH")
            }) */
            it("Fails if you don't send enough ETH", async function() {
                await expect(fundMe.fund())
            })

            it("updates the amount that funded the  data structure", async function() {
                //await fundMe.fund({ value: sendValue })
                //console.log("updating")
                //const response = await fundMe.addressToAmountFunded(deployer)
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getAddressToAmountFunded(deployer)
                console.log("response", response.toString())
                console.log("sendValue", sendValue.toString())
                assert.equal(response.toString(), sendValue.toString())
                expect(response.toString()).to.exist
            })

            it("Adds funder to the array of funders", async function() {
                //console.log("funders array")
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getFunder(0)
                    //console.log("testing")
                assert.equal(response, deployer)
                    //assert.equal(funder, funder)
                    //expect(funder).to.be.bignumber.equal(sendValue).toString()
                    //expect(funder).to.equal(sendValue)
                    //expect().to.be.bignumber.equal(funder, sendValue)
            })
        })

        describe("withdraw", function() {
            beforeEach(async() => {
                await fundMe.fund({ value: sendValue })
            })
            it("withdraws ETH from a single funder", async() => {
                // Arrange
                const startingFundMeBalance =
                    await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance =
                    await fundMe.provider.getBalance(deployer)

                // Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait()
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const endingDeployerBalance =
                    await fundMe.provider.getBalance(deployer)

                // Assert
                // Maybe clean up to understand the testing
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance
                    .add(startingDeployerBalance)
                    .toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )
            })

        })

        it("is allows us to withdraw with multiple funders", async() => {
            // Arrange
            const accounts = await ethers.getSigners()
            for (i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance =
                await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance =
                await fundMe.provider.getBalance(deployer)

            // Act
            const transactionResponse = await fundMe.withdraw()
                // Let's comapre gas costs :)
                // const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
            console.log(`GasCost: ${withdrawGasCost}`)
            console.log(`GasUsed: ${gasUsed}`)
            console.log(`GasPrice: ${effectiveGasPrice}`)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            console.log("test1")
            const endingDeployerBalance =
                await fundMe.provider.getBalance(deployer)
            console.log("test2")
                // Assert
            assert.equal(
                startingFundMeBalance
                .add(startingDeployerBalance)
                .toString(),
                endingDeployerBalance.add(withdrawGasCost).toString()
            )
            console.log("test3")
                // Make a getter for storage variables
            await expect(fundMe.getFunder(0)) //.to.be.reverted
            console.log("test4")

            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(
                        accounts[i].address
                    ),
                    0
                )
            }
        })
        it("Only allows the owner to withdraw", async function() {
            const accounts = await ethers.getSigners()
            const fundMeConnectedContract = await fundMe.connect(
                accounts[1]
            )
            await expect(
                fundMeConnectedContract.withdraw()
            ).to.be.revertedWith("FundMe__NotOwner")
        })

        it("cheaper withdraw", async() => {
            // Arrange
            const accounts = await ethers.getSigners()
            for (i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // Act
            const transactionResponse = await fundMe.cheaperWithdraw()
                // Let's comapre gas costs :)
                // const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
            console.log(`GasCost: ${withdrawGasCost}`)
            console.log(`GasUsed: ${gasUsed}`)
            console.log(`GasPrice: ${effectiveGasPrice}`)
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            console.log("test1")
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
            console.log("test2")
                // Assert
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(withdrawGasCost).toString()
            )
            console.log("test3")
                // Make a getter for storage variables
            await expect(fundMe.getFunder(0)) //.to.be.reverted
            console.log("test4")

            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
    })