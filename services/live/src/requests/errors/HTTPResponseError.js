class HTTPResponseError extends Error {
  constructor(response, ...args) {
    super(`${response.status} ${response.statusText}`, ...args);
    this.response = response;
    this.status = response.status;
    this.text = response.statusText;
    this.type = 'response';
  }
}

module.exports = HTTPResponseError;
