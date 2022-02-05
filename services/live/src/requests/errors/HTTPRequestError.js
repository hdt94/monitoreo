class HTTPRequestError extends Error {
  constructor(text, ...args) {
    super(text, ...args);
    this.text = text;
    this.type = 'request';
  }
}

module.exports = HTTPRequestError;
