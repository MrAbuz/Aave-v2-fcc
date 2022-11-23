require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

//patrick asked us to update our hardhat.config in the end like he had on github

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "0xkey"
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "0xkey"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "0xkey"

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL, //and this is another reason why we're using alchemy, it is fantastic in this forked blockchains
                //with this option we're now gonna be forking from eth mainnet whenever we work with the hardhat blockchain
            },
            blockConfirmations: 1,
        },
        goerli: {
            chainId: 5,
            blockConfirmations: 2,
            url: GOERLI_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [], //from patrick
            saveDeployments: true, //from patrick, dunno what's this for aswell
        },
        localhost: {
            chainId: 31337,
        },
    },
    etherscan: {
        //got this from patrick
        //im verifying automatically dont think I need this
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: false, //patrick in his github instead of false has "REPORT_GAS" and above in the variables = process.env.REPORT_GAS, but we didnt learn this I guess. we'll prob learn later on
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        //coinmarketcap: COINMARKETCAP_API_KEY,
    },
    solidity: {
        //got this from patrick
        compilers: [
            { version: "0.8.7" },
            { version: "0.4.24" },
            { version: "0.4.19" },
            { version: "0.6.12" },
        ],
    },
    //got this from patrick's github code, dont know what it does. we'll probably learn later
    contractSizer: {
        runOnCompile: false,
        only: ["Raffle"],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    mocha: {
        timeout: 500000, // 500 seconds max; if during our test anything doesnt get fired in under 200 seconds, the test will fail
    },
}
