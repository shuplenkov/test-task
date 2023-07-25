import { ethers } from 'hardhat';
import { logger } from '../src/log/logger';

async function main() {
  const contract = await ethers.deployContract('EchoContract');

  await contract.waitForDeployment();

  logger.info(`EchoContract deployed to ${contract.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  logger.error(error);

  process.exitCode = 1;
});
