import { Authenticator } from '../src/authenticator';

describe('Authenticator', () => {
  const TEST_URL = 'http://test';
  const TEST_UNKNOWN_URL = 'http://test2';
  const TEST_SECRET = 'NADRUUAEMYNRQACK';

  let authenticator: Authenticator;
  beforeEach(() => {
    authenticator = new Authenticator('test-');
    authenticator.clearSecrets();
  });

  describe('constructor', () => {
    it('should create an empty config', () => {
      expect(authenticator.hasSite(TEST_URL)).toEqual(false);
    });
  });

  describe('setSite', () => {
    it('should add a secret for a url', () => {
      authenticator.setSite(TEST_URL, TEST_SECRET);
      expect(authenticator.hasSite(TEST_URL)).toEqual(true);
    });
  });

  describe('calcToken', () => {
    beforeEach(() => {
      authenticator.setSite(TEST_URL, TEST_SECRET);
    });

    it('should calc a token for a known url', () => {
      expect(authenticator.calcToken(TEST_URL).length).toEqual(6);
    });

    it('should throw error for an unknown url', () => {
      expect(() => authenticator.calcToken(TEST_UNKNOWN_URL)).toThrowError();
    });
  });
});
