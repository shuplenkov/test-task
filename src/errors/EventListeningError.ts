export default class EventListeningError extends Error {
  constructor(message = 'Event listening failed') {
    super(message);

    this.name = 'EventListeningError';
  }
}
