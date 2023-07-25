process.env.NETWORK = 'localhost';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import { EchoContractInteractor } from '../../src/EchoContractInteractor';
import Web3 from 'web3';

describe('EchoContractInteractor', () => {
  let echoContractInteractor: EchoContractInteractor;
  let contract: any;

  beforeEach(async () => {

    // deploy the contract
    contract = await ethers.deployContract('EchoContract');

    await contract.waitForDeployment();

    // const accounts = await ethers.getSigners();
    const privateKey = 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // the private key of the first hardhat account

    const artifact = await hre.artifacts.readArtifact('EchoContract');

    console.info(`EchoContract deployed to ${contract.target.toString()}`);

    const web3: Web3 = new Web3('ws://localhost:8545');

    // initialize the contract interactor
    echoContractInteractor = new EchoContractInteractor(
      web3,
      artifact.abi,
      contract.target.toString(),
      privateKey,
    );
  });

  it('callCurrentBlockNumberMethod', async () => {
    const blockNumber = await echoContractInteractor.getCurrentBlockNumber();

    // Assert
    expect(blockNumber).to.to.be.greaterThan(0);
  });
});
