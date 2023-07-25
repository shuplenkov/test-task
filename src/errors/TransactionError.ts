export default class TransactionError extends Error {
  constructor(message = 'Transaction failed') {
    super(message);

    this.name = 'TransactionError';
  }
}
