import { isValidPrivate } from 'ethereumjs-util';

/**
 * Check if a private key is valid
 */
export function checkPrivateKey(privateKey: string): boolean {
  try {
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.slice(2);
    }

    // Convert to Buffer
    const privateKeyBuffer: Buffer = Buffer.from(privateKey, 'hex');

    return isValidPrivate(privateKeyBuffer);
  } catch (error) {
    return false;
  }
}
