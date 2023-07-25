import hre from 'hardhat';
import Web3 from 'web3';
import dotenv from 'dotenv';
import { EchoContractInteractor } from './EchoContractInteractor';
import ValidationError from './errors/ValidationError';
import { logger } from './log/logger';
import { checkPrivateKey } from './utils/checkPrivateKey';

dotenv.config();

// Get environment variables
const INFURA_API_KEY = process.env.INFURA_API_KEY ?? '';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ?? '';
const NETWORK = process.env.NETWORK ?? '';
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? '';

if (!INFURA_API_KEY || !CONTRACT_ADDRESS || !NETWORK || !PRIVATE_KEY) {
  throw new Error('Please ensure all environment variables are set');
}

async function main() {
  logger.info('Starting...');

  const web3: Web3 = new Web3(
    NETWORK === 'localhost' ? 'ws://localhost:8545' : `wss://${NETWORK}.infura.io/ws/v3/${INFURA_API_KEY}`,
  );

  // validate environment variables
  if (!web3.utils.isAddress(CONTRACT_ADDRESS)) {
    throw new ValidationError(`Invalid contract address: ${CONTRACT_ADDRESS}`);
  }

  if (!checkPrivateKey(PRIVATE_KEY)) {
    throw new ValidationError(`Invalid private key: ${PRIVATE_KEY}`);
  }

  // Read artifact to get ABI
  const echoContractArtifact = await hre.artifacts.readArtifact('EchoContract');

  const contractInteractor = new EchoContractInteractor(web3, echoContractArtifact.abi, CONTRACT_ADDRESS, PRIVATE_KEY);

  // Define callbacks
  const onDataCallback = (event: unknown) => {
    logger.info(`Event received:`, { event });

    contractInteractor.stopListeningToContractEvent();

    // Exit the application
    logger.info('Exit');
    process.exit();
  };

  const onErrorCallback = (error: Error) => {
    logger.error('Error received:', { error });
  };

  // Start interacting with the contract
  logger.info('Listening to contract event...');
  contractInteractor.listenToContractEvent(onDataCallback, onErrorCallback);
  logger.info('Success');

  logger.info('Calling contract method...');
  const blockNumber = await contractInteractor.getCurrentBlockNumber();
  logger.info(`Current block number: ${blockNumber}`);

  logger.info('Sending contract transaction...');
  await contractInteractor.emitEvent();
  logger.info('Waiting for the event...');
}

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error}`);

  process.exit(1);
});

// Run the application
(async () => {
  try {
    await main();
  } catch (error) {
    logger.error(error);

    process.exit(1);
  }
})();
