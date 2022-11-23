const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth } = require("../scripts/getWeth")
//and we used "yarn hardhat run scripts/aaveBorrow.js" which will automatically run on a eth mainnet fork because we have that option on hardhat.config.js

async function main() {
    //Aave treats everything as an ERC20 token, so that its much easier and simpler to code it
    //but ETH as we know isn't an ERC20 token, its a native blockchain token
    //what actually happens is when we deposit ethereum, they actually swap it for wrapped eth, which is ETH but as an ERC20
    //they normally send our ETH through an WETH gateway and swap it for WETH.
    //We'll skip using that WETH gateway and we'll just get the WETH token ourselves and use that as colateral.

    await getWeth()
    const { deployer } = await getNamedAccounts()

    const lendingPool = await getLendingPool(deployer)
    console.log(`Aave v2 Lending Pool Address: ${lendingPool.address}`)
}

//Now we wanna start interacting with the aave protocol v2:
//abi, address
//the way that aave works is that they actually have a contract which will point us to the correct contract (19:45:30)
//the contract that we'll be doing all the lending with is this "LendingPool"
//and there's actually a contract to get that contract address: "LendingPoolAddressesProvider", that will tell us the address of the "LendingPool"

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

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

//https://docs.aave.com/developers/v/2.0/the-core-protocol/addresses-provider then click in "deployed contracts" to get the below link with the address
//https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts (*) for the address of LendingPoolAddressesProvider
//https://docs.aave.com/developers/v/2.0/the-core-protocol/addresses-provider/ilendingpooladdressesprovider (**) for the interface of LendingPoolAddressesProvider

//https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool/ilendingpool (***) for the interface of LendingPool
//Atention:
//If I add some interface and it is importing some files from local places ("./"), search for its npm, yarn add --dev that npm and then change the location that its
//importing from "./" to the folders that they are located in node_modules (as I did in ILendingPool.sol)
//in this one actually we realise that its bugging because the interface is importing some files from some local places that we don't have, so
//we searched for "@aave/protocol-v2 npm" or maybe could've been "aave protocol v2 npm" and we added the aave protocol v2 from npm with
//yarn add --dev @aave/protocol-v2 (remember to do this when I copy some solidity and I dont have the files it imports in my local places)
//and then we need to change those imports so that they don't come from our local places "./" but instead from the node_modules as i've did in "ILendingPool.sol"
//so I look up the node_modules and find in which folder is it the file that they are trying to import and then its easy to point the location as I did there.

//In the end we ended up deleting the "IlendingPoolAddressesProvider.sol" interface that we added, because the "ILendingPool" interface that we copy pasted after
//was importing the "IlendingPoolAddressesProvider.sol" themselves, which made so that the "IlendingPoolAddressesProvider.sol" was being compiled twice, one from
//the solidity file that we created, and other from that import that is getting "IlendingPoolAddressesProvider.sol" from the npm aave protocol v2 that we added
//to the node modules. So we had 2 artifacts for the same name "IlendingPoolAddressesProvider.sol" which was throwing up an error. So Patrick said that since
//we already have that one "IlendingPoolAddressesProvider.sol" in the node modules that is being compiled, we can delete ours because they are the same.

//19:52:30
