import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('EchoContract', function () {
  async function deployFixture() {
    const EchoContract = await ethers.getContractFactory('EchoContract');
    const contract = await EchoContract.deploy();

    return { contract };
  }

  describe('Emit', function () {
    it('should emit EmitRequested event', async () => {
      const { contract } = await loadFixture(deployFixture);

      await expect(contract.emitEvent())
        .to.emit(contract, 'EmitRequested')
        .withArgs('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    });
  });

  describe('getCurrentBlockNumber', function () {
    it('should return current block number', async () => {
      const { contract } = await loadFixture(deployFixture);

      const currentBlockNumber = await ethers.provider.getBlockNumber();

      const result = await contract.getCurrentBlockNumber();
      expect(result).to.be.equal(currentBlockNumber);
    });
  });
});
