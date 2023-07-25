import { isValidPrivate } from 'ethereumjs-util';

export function checkPrivateKey(privateKey: string): boolean {
  // Make sure the private key is a Buffer
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');

  return isValidPrivate(privateKeyBuffer);
}
