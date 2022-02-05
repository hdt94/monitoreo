class Task {
  constructor(asyncFn, delay) {
    this._asyncFn = asyncFn;
    this._delay = delay;

    this.run = this.run.bind(this);
  }

  start() {
    this._intervalId = setInterval(this.run, this._delay);
  }

  async run() {
    try {
      await this._asyncFn();
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Task;
