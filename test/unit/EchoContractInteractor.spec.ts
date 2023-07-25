import { EchoContractInteractor } from '../../src/EchoContractInteractor';
import CallError from '../../src/errors/CallError';
import EventListeningError from '../../src/errors/EventListeningError';
import TransactionError from '../../src/errors/TransactionError';
import Web3, { ContractAbi } from 'web3';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('EchoContractInteractor', () => {
  let echoContractInteractor: EchoContractInteractor;
  let mockWeb3: Web3;
  let mockContractAddress: string;
  let mockPrivateKey: string;
  let mockAbi: ContractAbi;
  let web3Stub: sinon.SinonStub;
  let unsubscribeStub: sinon.SinonStub;
  let getCurrentBlockNumberStub: sinon.SinonStub;
  let encodeABIStub: sinon.SinonStub;
  let estimateGasStub: sinon.SinonStub;
  let getGasPriceStub: sinon.SinonStub;
  let sendSignedTransactionStub: sinon.SinonStub;
  let signTransactionStub: sinon.SinonStub;
  let emitRequestedStub: Record<string, sinon.SinonStub>;

  beforeEach(async () => {
    unsubscribeStub = sinon.stub();
    encodeABIStub = sinon.stub().returns('0xabc');
    estimateGasStub = sinon.stub().resolves(21000);
    getCurrentBlockNumberStub = sinon.stub().resolves('10n');
    getGasPriceStub = sinon.stub().resolves('1000000000');
    sendSignedTransactionStub = sinon.stub().resolves({ blockNumber: 10 });
    signTransactionStub = sinon.stub().resolves({ rawTransaction: '000' });
    emitRequestedStub = {
      on: sinon.stub(),
      unsubscribe: unsubscribeStub,
    };

    web3Stub = sinon.stub().returns({
      eth: {
        Contract: sinon.stub().returns({
          options: {
            address: '0x123',
          },
          methods: {
            getCurrentBlockNumber: () => ({
              call: getCurrentBlockNumberStub,
            }),
            emitEvent: () => ({
              encodeABI: encodeABIStub,
              estimateGas: estimateGasStub,
            }),
          },
          events: {
            EmitRequested: () => emitRequestedStub,
          },
        }),
        accounts: {
          wallet: {
            add: sinon.stub(),
            '0': { address: '0x456', privateKey: '0xabc' },
          },
          signTransaction: signTransactionStub,
        },
        getGasPrice: getGasPriceStub,
        sendSignedTransaction: sendSignedTransactionStub,
      },
    } as any);

    mockWeb3 = web3Stub();
    mockContractAddress = '0x123';
    mockPrivateKey = '0xabc';
    mockAbi = [
      {
        constant: true,
        inputs: [],
        name: 'getCurrentBlockNumber',
        outputs: [
          {
            name: '',
            type: 'uint256',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
    ];

    echoContractInteractor = new EchoContractInteractor(mockWeb3, mockAbi, mockContractAddress, mockPrivateKey);
  });

  it('should create an instance of EchoContractInteractor', () => {
    expect(echoContractInteractor).to.be.an.instanceof(EchoContractInteractor);
  });

  describe('getCurrentBlockNumber', () => {
    it('should call getCurrentBlockNumber method and return current block number', async () => {
      const result = await echoContractInteractor.getCurrentBlockNumber();

      expect(result).to.be.an('number');
      expect(result).to.be.equal(10);
      expect(getCurrentBlockNumberStub).to.have.been.calledOnceWithExactly({ from: '0x456' });
    });

    it('should throw CallError', async () => {
      getCurrentBlockNumberStub.rejects(new Error('Call error'));

      try {
        await echoContractInteractor.getCurrentBlockNumber();

        expect.fail('it should not reach here');
      } catch (error) {
        expect(error).to.be.an.instanceof(CallError);
        expect(error.message).to.be.equal('Failed to call contract function: Call error');
        expect(getCurrentBlockNumberStub).to.have.been.calledOnceWithExactly({ from: '0x456' });
      }
    });
  });

  describe('emitEvent', () => {
    it('should send emitEvent transaction', async () => {
      const result = await echoContractInteractor.emitEvent();

      expect(result).to.deep.equal({ blockNumber: 10 });
      expect(encodeABIStub).to.have.been.calledOnce;
      expect(estimateGasStub).to.have.been.calledOnceWithExactly({ from: '0x456' });
      expect(getGasPriceStub).to.have.been.calledOnce;
      expect(signTransactionStub).to.have.been.calledOnceWithExactly(
        {
          from: '0x456',
          to: '0x123',
          gasPrice: '1000000000',
          gas: 21000,
          data: '0xabc',
        },
        '0xabc',
      );
      expect(sendSignedTransactionStub).to.have.been.calledOnceWithExactly('000');
    });

    it('should throw TransactionError', async () => {
      signTransactionStub.rejects(new Error('Transaction error'));

      try {
        await echoContractInteractor.emitEvent();

        expect.fail('it should not reach here');
      } catch (error) {
        expect(error).to.be.an.instanceof(TransactionError);
        expect(error.message).to.be.equal('Failed to perform transaction: Transaction error');
        expect(sendSignedTransactionStub).to.have.not.been.called;
      }
    });
  });

  describe('listenToContractEvent', () => {
    it('should listen to BlockNumberRequested event', () => {
      const mockDataCallback = sinon.stub();
      const mockErrorCallback = sinon.stub();

      echoContractInteractor.listenToContractEvent(mockDataCallback, mockErrorCallback);

      expect(emitRequestedStub.on).to.have.been.calledTwice;
      expect(emitRequestedStub.on.getCall(0).args).to.be.deep.equal(['data', mockDataCallback]);
      expect(emitRequestedStub.on.getCall(1).args).to.be.deep.equal(['error', mockErrorCallback]);
    });

    it('should throw EventListeningError', async () => {
      const mockDataCallback = sinon.stub();
      const mockErrorCallback = sinon.stub();

      emitRequestedStub.on.throws(new Error('Event listening error'));

      try {
        echoContractInteractor.listenToContractEvent(mockDataCallback, mockErrorCallback);

        expect.fail('it should not reach here');
      } catch (error) {
        expect(error).to.be.an.instanceof(EventListeningError);
        expect(error.message).to.be.equal('Failed to listen to contract event: Event listening error');
      }
    });
  });

  describe('stopListeningToContractEvent', () => {
    it('should stop listening to BlockNumberRequested event', async () => {
      const mockDataCallback = sinon.stub();
      const mockErrorCallback = sinon.stub();

      echoContractInteractor.listenToContractEvent(mockDataCallback, mockErrorCallback);

      await echoContractInteractor.stopListeningToContractEvent();

      expect(unsubscribeStub).to.have.been.calledOnce;
    });

    it('should not stop listening to BlockNumberRequested event if not subscribed', async () => {
      await echoContractInteractor.stopListeningToContractEvent();

      expect(unsubscribeStub).to.have.not.been.called;
    });
  });
});
