const merge = require('lodash.merge');
const request = require('request-promise-native');

module.exports = class Abstract {
  static get ROOT_URL() {
    const BASE_URL = Abstract.BASE_URL || this.BASE_URL;
    const API_VERSION = Abstract.API_VERSION || this.API_VERSION || 30;
    if (!BASE_URL) {
      throw new Error('BASE_URL not set');
    }
    return `${BASE_URL}/pal/servlet/Payment/v${API_VERSION}`;
  }

  static setAppAuth(user, pass) {
    Abstract.appAuthId = {
      user,
      pass,
    }
  }

  static setAuth(user, pass) {
    this.authId = {
      user,
      pass,
    }
  }

  static get auth() {
    if (!Abstract.appAuthId && !this.authId) {
      throw new Error('Auth not set');
    }
    return this.authId || Abstract.appAuthId;
  }

  static get merchantAccount() {
    return this.classMerchantAccount || Abstract.appMerchantAccount;
  }

  static $request(path, reference, obj) {
    return request({
      uri: `${this.ROOT_URL}/${path}`,
      method: 'POST',
      json: true,
      headers: { 'Content-Type': 'application/json' },
      auth: this.auth,
      body: merge(
        {
          reference,
          merchantAccount: this.merchantAccount,
        },
        obj,
      ),
    });
  }
};