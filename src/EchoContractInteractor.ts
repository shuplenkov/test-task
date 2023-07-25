import Web3, { Contract, ContractAbi, Transaction, TransactionReceipt } from 'web3';
import CallError from './errors/CallError';
import EventListeningError from './errors/EventListeningError';
import TransactionError from './errors/TransactionError';
import { logger } from './log/logger';
import ensure0xPrefix from './utils/ensure0xPrefix';

type DataCallback = (event: unknown) => void;
type ErrorCallback = (error: Error) => void;

// Define the class that will interact with the smart contract
export class EchoContractInteractor {
  private readonly contract: Contract<ContractAbi>;
  private eventSubscription?: ReturnType<Contract<ContractAbi>['events']['BlockNumberRequested']>;
  private readonly web3: Web3;
  private readonly account: string;

  constructor(web3: Web3, contractAbi: ContractAbi, contractAddress: string, privateKey: string) {
    this.web3 = web3;
    this.contract = new this.web3.eth.Contract(contractAbi, contractAddress);
    this.web3.eth.accounts.wallet.add(ensure0xPrefix(privateKey));
    this.account = this.web3.eth.accounts.wallet[0].address;
  }

  // Call a function on the contract and return the result
  async getCurrentBlockNumber(): Promise<number> {
    try {
      const result: string = await this.contract.methods.getCurrentBlockNumber().call({ from: this.account });

      return parseInt(result, 10);
    } catch (error) {
      logger.debug('Error calling contract function: ', { error });

      throw new CallError(`Failed to call contract function: ${error.message}`);
    }
  }

  // Perform a transaction on the contract
  async emitEvent(): Promise<TransactionReceipt> {
    try {
      const transaction = this.contract.methods.emitEvent().encodeABI();
      const gasPrice = await this.web3.eth.getGasPrice();
      const gas = await this.contract.methods.emitEvent().estimateGas({ from: this.account });

      const tx: Transaction = {
        from: this.account,
        to: this.contract.options.address,
        gasPrice,
        gas,
        data: transaction,
      };

      const signedTx = await this.web3.eth.accounts.signTransaction(tx, this.web3.eth.accounts.wallet[0].privateKey);

      return this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    } catch (error) {
      logger.debug('Error performing transaction:', { error });

      throw new TransactionError(`Failed to perform transaction: ${error.message}`);
    }
  }

  // Listen to EmitRequested event on the contract
  listenToContractEvent(onDataCallback: DataCallback, onErrorCallback: ErrorCallback): void {
    try {
      this.eventSubscription = this.contract.events.EmitRequested();
      this.eventSubscription.on('data', onDataCallback);
      this.eventSubscription.on('error', onErrorCallback);
    } catch (error) {
      logger.debug('Error listening to contract event: ', error);

      throw new EventListeningError(`Failed to listen to contract event: ${error.message}`);
    }
  }

  // Stop listening to the event
  async stopListeningToContractEvent(): Promise<void> {
    if (this.eventSubscription) {
      try {
        await this.eventSubscription.unsubscribe();
      } catch (error) {
        logger.debug('Error stopping to listen to contract event: ', { error });

        throw new EventListeningError(`Failed to stop listening to contract event: ${error.message}`);
      }
    }
  }
}
