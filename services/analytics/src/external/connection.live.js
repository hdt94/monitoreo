const io = require('socket.io-client');

class Connection {
  init({ liveHost }) {
    this.socket = io(`ws://${liveHost}`, {
      path: '/ws/',
    });
  }

  notify(message) {
    this.socket.emit('notify', message);
  }
}

module.exports = new Connection();
