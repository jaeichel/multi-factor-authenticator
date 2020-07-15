class Storage {
  setNonce(value) {
    return Storage._set('nonce', value);
  }

  get nonce() {
    return Storage._get('nonce');
  }

  setUsername(value) {
    return Storage._set('username', value);
  }

  get username() {
    return Storage._get('username');
  }

  setPublicKey(jwk) {
    return Storage._set('publicKey', jwk);
  }

  get publicKey() {
    return Storage._get('publicKey');
  }

  setPrivateKey(jwk) {
    return Storage._set('privateKey', jwk);
  }

  get privateKey() {
    return Storage._get('privateKey');
  }

  static _set(key, value) {
    return new Promise(resolve => chrome.storage.local.set({ [key]: value}, () => resolve()));
  }

  static _get(key) {
    return new Promise(resolve => chrome.storage.local.get(key, value => resolve(value[key])));
  }
}