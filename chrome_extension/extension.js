class Extension {
  constructor() {
    this.jwt = new JWT();
    this.mfaApi = new MFAAPI();
    this.storage = new Storage();

    this._username = null;
    this._nonce = null;
    this._jwkKeypair = {
      public: null,
      private: null
    };
  }

  get username() {
    return this._username;
  }

  get nonce() {
    return this._nonce;
  }

  get publicKey() {
    return this._jwkKeypair.public;
  }

  init(username) {
    const keypair = JWT.generateJwkKeypair();
    const nonce = 0;
    this.jwt = new JWT(username, keypair, nonce);

    return this.storage.setNonce(nonce)
      .then(() => this.storage.setUsername(username))
      .then(() => this.storage.setPublicKey(keypair.public))
      .then(() => this.storage.setPrivateKey(keypair.private))
      .then(() => this.readStorage());
  }

  readStorage() {
    return this.storage.username
      .then(username => this._username = username)
      .then(() => this.storage.nonce)
      .then(nonce => this._nonce = nonce)
      .then(() => this.storage.publicKey)
      .then(publicKey => this._jwkKeypair.public = publicKey)
      .then(() => this.storage.privateKey)
      .then(privateKey => this._jwkKeypair.private = privateKey)
      .then(() => this.jwt = new JWT(this._username, this._jwkKeypair, this._nonce));
  }

  test() {
    this.mfaApi.test();
  }
}