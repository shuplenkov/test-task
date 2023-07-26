import Web3, { WebSocketProvider } from 'web3';

interface ErrorHandler {
  (error: unknown): void;
}

interface IWsOptions {
  autoReconnect?: boolean;
  delay?: number;
  maxAttempts?: number;
}

const defaultOptions: IWsOptions = {
  autoReconnect: true,
  delay: 5000,
  maxAttempts: Infinity,
};

/**
 * Create a Web3 instance with a WebSocketProvider
 */
export default function web3Factory(url: string, errorHandler: ErrorHandler, options?: IWsOptions): Web3 {
  const provider = new WebSocketProvider(
    url,
    {},
    {
      ...defaultOptions,
      ...options,
    },
  );

  provider.on('error', errorHandler);

  return new Web3(provider);
}
