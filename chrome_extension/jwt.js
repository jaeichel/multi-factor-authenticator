class JWT {
  constructor(username, jwkKeypair, nonce) {
    this.username = username;
    this.jwkKeypair = jwkKeypair;
    this.nonce = nonce;
  }

  static generateJwkKeypair() {
    const keypair = KEYUTIL.generateKeypair("RSA", 1024);
    return {
      private: KEYUTIL.getJWKFromKey(keypair.prvKeyObj),
      public:  KEYUTIL.getJWKFromKey(keypair.pubKeyObj)
    };
  }

  publicKeyThumbprint() {
    return  KJUR.jws.JWS.getJWKthumbprint(this.jwkKeypair.public);
  }

  generateToken() {
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };
    
    const tNow = KJUR.jws.IntDate.get('now');
    const tEnd = KJUR.jws.IntDate.get('now + 1day');
    const payload = {
      iss: 'multi-factor-authenticator-extension',
      sub: this.username,
      nbf: tNow,
      iat: tNow,
      exp: tEnd,
      jti: this.nonce,
      aud: `${SERVER}/mfa`
    };

    const key = KEYUTIL.getKey(this.jwkKeypair.private);
    return KJUR.jws.JWS.sign("RS256",  JSON.stringify(header), JSON.stringify(payload), key);
  }
}