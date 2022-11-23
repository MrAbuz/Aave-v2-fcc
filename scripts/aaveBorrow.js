async function main() {
    //Aave treats everything as an ERC20 token, so that its much easier and simpler to code it
    //but ETH as we know isn't an ERC20 token, its a native blockchain token
    //what actually happens is when we deposit ethereum, they actually swap it for wrapped eth, which is ETH but as an ERC20
    //they normally send our ETH through an WETH gateway and swap it for WETH.
    //We'll skip using that WETH gateway and we'll just get the WETH token ourselves and use that as colateral.
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
