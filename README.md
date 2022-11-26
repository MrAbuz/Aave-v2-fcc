On Aave: 

1. Deposit collateral: ETH / WETH
2. Borrow another asset: DAI
3. Repay the DAI






TradeOffs of FORKING mainnet eth to run the scripts / tests etc:
(many times we can use this instead of mocks)

Pros: Quick, easy, resemble what's on the mainnet
Cons: We need an API, some contracts are complex to work with

But using a forked network might be a good way to run our tests, might be a good alternative to just using mocks
It really depends what's right for me and what's right for our project
But its a fantastic tool, specially for something like Aave where we wanna quickly test some things

Hardhat forking will also give us a bunch of fake accounts on forked mainnet with ETH