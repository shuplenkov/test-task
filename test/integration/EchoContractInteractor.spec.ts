process.env.NETWORK = 'localhost';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import * as hre from 'hardhat';
import { EchoContractInteractor } from '../../src/EchoContractInteractor';
import Web3 from 'web3';
import { logger } from '../../src/log/logger';

describe('EchoContractInteractor', () => {
  let echoContractInteractor: EchoContractInteractor;
  let contract: any;
  let web3: Web3;

  beforeEach(async () => {
    // deploy the contract
    contract = await ethers.deployContract('EchoContract');

    await contract.waitForDeployment();

    const privateKey: string = 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // the private key of the first hardhat account

    const artifact = await hre.artifacts.readArtifact('EchoContract');

    web3 = new Web3('ws://localhost:8545');

    // initialize the contract interactor
    echoContractInteractor = new EchoContractInteractor(web3, artifact.abi, contract.target.toString(), privateKey);
  });

  after(async () => {
    if (echoContractInteractor) {
      await echoContractInteractor.stopListeningToContractEvent();
    }
    await web3?.currentProvider?.disconnect();
  });

  describe('getCurrentBlockNumber', () => {
    it('should call getCurrentBlockNumber', async () => {
      const blockNumber: number = await echoContractInteractor.getCurrentBlockNumber();

      expect(blockNumber).to.to.be.greaterThan(0);
    });
  });

  describe('listenToContractEvent', () => {
    it('should listen to contract event', async () => {
      await new Promise<void>(async (resolve) => {
        const onDataCallback = (event: unknown): void => {
          expect(event).to.be.an('object');

          resolve();
        };

        const onErrorCallback = (error: Error) => {
          logger.error('Error received:', { error });
        };

        echoContractInteractor.listenToContractEvent(onDataCallback, onErrorCallback);

        await echoContractInteractor.emitEvent();
      });
    });
  });
});
