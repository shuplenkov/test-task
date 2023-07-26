/**
 * Ensures that the given string has a 0x prefix.
 */
export default function ensure0xPrefix(str: string): string {
  return str.startsWith('0x') ? str : `0x${str}`;
}
