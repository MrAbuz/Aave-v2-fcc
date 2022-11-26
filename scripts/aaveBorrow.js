const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth")
//we used "yarn hardhat run scripts/aaveBorrow.js" which will automatically run on a eth mainnet fork because we have that option on hardhat.config.js
//to do this using other protocols just grab their docs in the parts that they explain their functions and it'll be easy

async function main() {
    //Aave treats everything as an ERC20 token, so that its much easier and simpler to code it
    //but ETH as we know isn't an ERC20 token, its a native blockchain token
    //what actually happens is when we deposit ethereum, they actually swap it for wrapped eth, which is ETH but as an ERC20
    //they normally send our ETH through an WETH gateway and swap it for WETH.
    //We'll skip using that WETH gateway and we'll just get the WETH token ourselves and use that as colateral.

    const { deployer } = await getNamedAccounts()
    await getWeth()

    const lendingPool = await getLendingPool(deployer)
    console.log(
        `We got the Aave v2 Lending Pool Address: ${lendingPool.address}`
    )

    // Deposit:
    //(attention!) We notice in the deposit() function from github that it'll call the erc20 safeTransferFrom() function to pull some tokens from us, so we realize that we need to approve first.
    //Probably in the frontend it makes us call the function first and then we call the deposit() after, but as we're calling deposit() programatically, we need to do it ourselves. My guess :P
    //Lets approve:
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" //this should be modularized aswell and imported from the helper hardhat config

    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer) //makes sense that I dont need to wait(1) here. I'm waiting 1 inside the function already, here I just need to await
    console.log("Depositing...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0) //this referralCode variable (the last one) will be 0 because its descontinued. And it wouldn't be for us anyway
    console.log("Deposited!")

    // Borrow:
    // We wanna know: How much we have borrowed, how much we have in collateral, how much we can borrow
    // There's a function from aave that lets us do it: getUserAccountData() (*****)
    // Remember that we can only borrow a % of our collateral

    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        deployer
    )

    //Now we wanna know what's the conversion rate on DAI is? How much DAI can I borrow with "availableBorrowsETH"?
    //The borrow function takes the amount of borrow denominated in the asset we wanna borrow I must guess
}
//Now we wanna start interacting with the aave protocol v2:
//abi, address
//the way that aave works is that they actually have a contract which will point us to the correct contract (19:45:30)
//the contract that we'll be doing all the lending with is this "LendingPool"
//and there's actually a contract to get that contract address: "LendingPoolAddressesProvider", that will tell us the address of the "LendingPool"
//Imo they probably do this bcuz LendingPool address changes and so they dont break the automations of people, we get the new addresses automatically from that provider.

//Lending Pool Address Provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5 (*)
//Lending Pool:

//so let's create a function that will get us the "Lending Pool" address from the "LendingPoolAddressesProvider"
//we have the address (docs *), so we need the abi: we can look it up directly in the blockchain(etherscan) or we can use the docs to pick the interface. (**)
//remember that after copying the interface, we need to compile it to get the abi!

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )
    const lendingPoolAddress =
        await lendingPoolAddressesProvider.getLendingPool()

    //the address of lendingPool is what we get from the provider above, and the abi we'll get the interface from the docs (***) and get the abi
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    )
    return lendingPool
}

async function approveErc20(
    //Nice. A generic function that we created to approve ERC20's, will be super useful
    erc20Address,
    spenderAddress,
    amountToSpend,
    account
) {
    const erc20Token = await ethers.getContractAt(
        "IERC20", //(****)
        erc20Address,
        account
    )

    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved!")
}

async function getBorrowUserData(lendingPool, account) {
    //(*****) function to know how much we have as colateral, how much we have borrowed and how much we can borrow, and more variables
    //okaaay this is how we get specific return variables or function from some function, with {}. Makes sense, in the useStates of Moralis it's the same
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`)

    return { availableBorrowsETH, totalDebtETH } //and need the {} to return more than 1 variable
    //good function to learn how to work with getting the return variables/functions from a function
}

async function getDaiPrice() {
    //function to know the dai value of x amount of ETH
    //Aave has its own function that we can use to know the price conversion and it uses Chainlink too (******)
    //but since we know how to use the chainlink directly that's what we're gonna do (because the aave market checks from the same chainlink aggregator)
    //got the chainlink aggregatorv3interface from patrick's github (*******) but we could get from chainlink github/docs or import from chainlink npm aswell. Nice!
    //Remember: if I search for chainlink npm, and yarn add --dev that npm, it'll store all the files in node_modules and then I can create a sol file that
    //          imports from one of those folders, and it would be the same as copy pasting the code to a sol file! a good solution
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

//https://docs.aave.com/developers/v/2.0/the-core-protocol/addresses-provider then click in "deployed contracts" to get the below link with the address
//https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts (*) for the address of LendingPoolAddressesProvider, (and actually has a lot other addresses including LendingPool but probably LendingPool and other addresses change and in order to not break the automated systems of people, we get from that provider address and they update the provider, so our system always get updated automatically when they change. This is my guess :D)
//https://docs.aave.com/developers/v/2.0/the-core-protocol/addresses-provider/ilendingpooladdressesprovider (**) for the interface of LendingPoolAddressesProvider
//https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool/ilendingpool (***) for the interface of LendingPool

//https://github.com/PatrickAlphaC/hardhat-defi-fcc/blob/main/contracts/interfaces/IERC20.sol (****) got the erc20 interface from patrick github but I might find it from openzepeling or something I think
//https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool (*****) -> ctrl f "getUserAccountData"
//https://docs.aave.com/developers/v/2.0/the-core-protocol/price-oracle (******)

//Attention:
//If I add some interface and it is importing some files from local places ("./"), search for its npm, yarn add --dev that npm and then change the location that its
//importing from "./" to the folders that they are located in node_modules (as I did in ILendingPool.sol)
//in this one we realised that its bugging because the interface is importing some files from some local places that we don't have, so
//we searched for "@aave/protocol-v2 npm" or maybe could've been "aave protocol v2 npm" also worked, and we added the aave protocol v2 from npm with
//yarn add --dev @aave/protocol-v2.
//and then we need to change those imports so that they don't come from our local places "./" but instead from the node_modules as i've did in "ILendingPool.sol"
//so I look up the node_modules and find in which folder the files are that they are trying to import and then its easy to point the location as I did there.

//In the end we ended up deleting the "IlendingPoolAddressesProvider.sol" interface that we added, because the "ILendingPool" interface that we copy pasted after
//was importing the "IlendingPoolAddressesProvider.sol" themselves, which made so that the "IlendingPoolAddressesProvider.sol" was being compiled twice, one from
//the solidity file that we created, and other from that import that is getting "IlendingPoolAddressesProvider.sol" from the npm aave protocol v2 that we added
//to the node modules. So we had 2 artifacts for the same name "IlendingPoolAddressesProvider.sol" which was throwing up an error. So Patrick said that since
//we already have that one "IlendingPoolAddressesProvider.sol" in the node modules that is being compiled, we can delete ours because they are the same.

//19:52:30
