import fs from 'fs';
import path from 'path';

import { authenticator } from 'otplib';

export class Authenticator {
  public readonly configFile: string;
  private _secrets: { [url: string]: string };

  constructor(configFilePrefix: string = '') {
    const appDir =
      process.env.APPDATA ||
      (process.platform === 'darwin'
        ? process.env.HOME + '/Library/Preferences'
        : process.env.HOME + '/.local/share');
    const configDir = path.join(appDir, 'multi-factor-authenticator');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir);
    }

    this.configFile = path.join(configDir, `${configFilePrefix}secrets.json`);
    if (!fs.existsSync(this.configFile)) {
      fs.writeFileSync(this.configFile, JSON.stringify({}));
    }
    this._secrets = JSON.parse(fs.readFileSync(this.configFile, 'utf-8'));
    console.log(`using config file ${this.configFile}`);
  }

  clearSecrets() {
    Object.keys(this._secrets).forEach(key => delete this._secrets[key]);
    fs.writeFileSync(this.configFile, JSON.stringify(this._secrets));
  }

  hasSite(url: string): boolean {
    return this._secrets.hasOwnProperty(url);
  }

  setSite(url: string, secret: string) {
    this._secrets[url] = secret;
    fs.writeFileSync(this.configFile, JSON.stringify(this._secrets));
  }

  calcToken(url: string): string {
    if (!this._secrets.hasOwnProperty(url)) {
      throw new Error(`cannot find token for ${url}`);
    }
    const secret = this._secrets[url];
    const token = authenticator.generate(secret);
    return token;
  }
}
