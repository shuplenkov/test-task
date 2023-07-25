import { expect } from 'chai';
import { checkPrivateKey } from '../../../src/utils/checkPrivateKey';

describe('checkPrivateKey', () => {
  it('should return true for a valid private key', () => {
    const privateKey: string = 'a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2';
    const result = checkPrivateKey(privateKey);

    expect(result).to.be.true;
  });

  it('should return false for an invalid private key', () => {
    const privateKey = 'invalidPrivateKey';
    const result = checkPrivateKey(privateKey);

    expect(result).to.be.false;
  });
});
