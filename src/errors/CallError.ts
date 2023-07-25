export default class CallError extends Error {
  constructor(message = 'Call failed') {
    super(message);

    this.name = 'CallError';
  }
}
