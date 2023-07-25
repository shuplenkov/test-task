export default function ensure0xPrefix(str: string): string {
  return str.startsWith('0x') ? str : `0x${str}`;
}
