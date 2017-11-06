module.exports = class Payment extends require('./abstract.js') {
  setAmount(value, currency) {
    this.amount = {value, currency};
  }

  set cseToken(val) {
    this.additionalData = this.additionalData || {};
    this.additionalData['card.encrypted.json'] = val;
  }

  async authorize(reference) {
    if (this.authorization) {
      throw new Error('Already authorized !');
    }
    const { resultCode, authCode, pspReference } = await Payment.$request(
      'authorise',
      reference,
      {
        amount: this.amount,
        additionalData: this.additionalData,
      },
    );
    if (!authCode) {
      throw new Error(`Authorization failed : ${resultCode}.`);
    }
    this.authorization = pspReference;
    return this;
  }

  async capture(reference) {
    if (this.captureCode) {
      throw new Error('Already captured !');
    }
    if (!this.authorization) {
      throw new Error('Should be authorized');
    }
    const { response, pspReference } = await Payment.$request(
      'capture',
      reference,
      {
        modificationAmount: this.amount,
        originalReference: this.authorization,
      },
    );
    if (response !== '[capture-received]') {
      throw new Error(`Capture failed : ${response}.`);
    }
    this.captureCode = pspReference;
    return this;
  }
};