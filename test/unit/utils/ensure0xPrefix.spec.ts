import { expect } from 'chai';
import ensure0xPrefix from '../../../src/utils/ensure0xPrefix';

describe('ensure0xPrefix', () => {
  it('should add 0x prefix if it does not exist', () => {
    const result = ensure0xPrefix('123abc');
    expect(result).to.equal('0x123abc');
  });

  it('should not add 0x prefix if it already exists', () => {
    const result = ensure0xPrefix('0x123abc');
    expect(result).to.equal('0x123abc');
  });
});
