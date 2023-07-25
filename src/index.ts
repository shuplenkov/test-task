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

// const web3 = new Web3('wss://eth-sepolia.g.alchemy.com/v2/pxyTgklgeXqaQ0y1YJfHUZFaAanW3X28');
async function main() {
  logger.info('Starting...');

  const web3: Web3 = new Web3(
    NETWORK === 'local' ? 'ws://localhost:8545' : `wss://${NETWORK}.infura.io/ws/v3/${INFURA_API_KEY}`,
  );

  if (!web3.utils.isAddress(CONTRACT_ADDRESS)) {
    throw new ValidationError(`Invalid contract address: ${CONTRACT_ADDRESS}`);
  }

  if (!checkPrivateKey(PRIVATE_KEY)) {
    throw new ValidationError(`Invalid private key: ${PRIVATE_KEY}`);
  }

  const echoContractArtifact = await hre.artifacts.readArtifact('EchoContract');

  const contractInteractor = new EchoContractInteractor(web3, echoContractArtifact.abi, CONTRACT_ADDRESS, PRIVATE_KEY);

  const onDataCallback = (event: unknown) => {
    logger.info(`Event received:`, { event });

    contractInteractor.stopListeningToContractEvent();

    logger.info('Exit');
    process.exit();
  };

  const onErrorCallback = (error: Error) => {
    logger.error('Error received:', { error });
  };

  logger.info('Listening to contract event...');
  contractInteractor.listenToContractEvent(onDataCallback, onErrorCallback);
  logger.info('Success');

  logger.info('Calling contract method...');
  const blockNumber = await contractInteractor.getCurrentBlockNumber();
  logger.info(`Current block number: ${blockNumber}`);

  logger.info('Sending contract transaction...');
  await contractInteractor.emitEvent();
  logger.info('Success');
}

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error}`);

  process.exit(1);
});

(async () => {
  try {
    await main();
  } catch (error) {
    logger.error(error);

    process.exit(1);
  }
})();
