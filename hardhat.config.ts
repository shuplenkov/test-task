import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import { config as dotEnvConfig } from 'dotenv';
import ensure0xPrefix from './src/utils/ensure0xPrefix';

dotEnvConfig();

const INFURA_API_KEY: string = process.env.INFURA_API_KEY ?? '';
const PRIVATE_KEY: string = process.env.PRIVATE_KEY ?? '';

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://localhost:8545',
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ensure0xPrefix(PRIVATE_KEY)],
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ensure0xPrefix(PRIVATE_KEY)],
    },
  },
  paths: {
    tests: './test/contracts',
  },
};

export default config;
