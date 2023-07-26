# Web3 Test Task

This is a simple Node.js application that interacts with an Ethereum smart contract using Web3.js.

## Description

The `EchoContract` has view method `getCurrentBlockNumber` which returns the current block number and method
`emitEvent` which emits `EmitRequested` event with the sender address.

The project uses `Hardhat` to compile and deploy the smart contract to the network.
The `dotenv` package is used to load environment variables from the `.env` file.
The `web3` package is used to interact with the smart contract.
The `mocha` and `chai` packages are used for testing.
The `winston` package is used for logging.
And the `ethereumjs-util` package is used to validate private key.

It uses `Infura` to connect to the Ethereum network and `Hardhat` local node for testing.

## Setup

1. Install Node.js 18 (or higher) and npm if you haven't already. You can download Node.js from the official website: https://nodejs.org/

2. Clone this repository and navigate into the project directory.

3. Install the project dependencies:

```bash
npm ci
```

4. Create a `.env` file in the project directory
```bash
 cp .env.example .env
```

and add the following environment variables:

```
INFURA_API_KEY - API key for Infura (https://infura.io/). WebSocket must be enabled.
PRIVATE_KEY - Private key of the Ethereum account to use for transactions.
NETWORK - Ethereum network to use. Possible values: mainnet, sepolia, localhost.
```

If you need to have some ether on the account, you can use any faucets, e.g. https://sepoliafaucet.com/

5. Compile the smart contract:

```bash
npm run contract:compile
```

6. Deploy the smart contract to the network:

```bash
npm run contract:deploy -- --network localhost
```

replace `localhost` with `mainnet` or `sepolia` to deploy to the mainnet or sepolia network respectively.

7. Paste the contract address in the .env file

```
CONTRACT_ADDRESS - Contract address of the deployed smart contract.
```

## Usage

To run the application just run the following command:

```bash
npm start
```

If you are using the local node, you need to run it first:

```bash
npm run node
```

The app will call the `getCurrentBlockNumber` method of the smart contract and print the result to the console.
After that it will subscribe `EmitRequested` event, send `emitEvent` transaction and print the event data to the console.

## Testing

1. To run the unit tests:

```bash
npm run test:unit
```

2. To run the integration tests:

Run the local node:
```bash
npm run node
```

then run the tests:
```bash
npm run test:integration
```

3. To run contract tests:

Run the local node as described above and then run the tests:
```bash
npm run test:contract
```

4. To run all tests:
   Run the local node as described above and then run the tests:
```bash
npm test
```
