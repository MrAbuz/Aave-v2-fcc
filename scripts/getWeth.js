//we're going to build a script that will deposit our ETH to get the WETH token (ERC20 version of ETH)

const { getNamedAccounts, ethers } = require("hardhat")

//in this script we're not gonna add the "main() .then( process.exit(0))... etc".
//We're gonna create this getWeth.js just like kind of a module and we're gonna import it into our aaveBorrow.js
//because of this we add "module.exports" istead. Interestiiiing

const AMOUNT = ethers.utils.parseEther("0.02")

async function getWeth() {
    const { deployer } = await getNamedAccounts() //we're gonna need an account

    // call the "deposit" function on the weth contract
    // abi (we just need the interface to get the abi), then yarn hardhat compile it. got the interface from patrick github repo but should be easy to get from etherscan, and should probably check if its the exact real one to apply
    // contract address: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 (weth mainnet address that we got from etherscan)

    //getContractAt -> a function of ethers that allows us to get the contract at a specific address, nice!
    //"IWeth" abi as the first parameter because we added the Iweth interface in a contracts folder and "yarn hardhat compile" it
    //the address which for now we'll hardcode it
    const iWeth = await ethers.getContractAt(
        "IWeth",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        deployer
    )
    const tx = await iWeth.deposit({ value: AMOUNT })
    await tx.wait(1)

    const wethBalance = await iWeth.balanceOf(deployer) //we'll call the balanceOf() function of the weth contract to know the balance
    console.log(`Got ${wethBalance.toString()} WETH`)
}

module.exports = { getWeth }
