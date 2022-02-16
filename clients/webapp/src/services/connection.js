import { io } from 'socket.io-client';

import * as httpRequests from './http';

const TYPE_HTTP_REQUEST_MAP = {
  create: httpRequests.__post,
  read: httpRequests.__get,
  update: httpRequests.__put,
  delete: httpRequests.__delete,
};

function __join(socket, rooms) {
  if (rooms.length > 0) {
    socket.emit('join', { rooms });
  }
}

function __leave(socket, rooms) {
  if (rooms.length > 0) {
    socket.emit('leave', { rooms });
  }
}

function __request(socket, request, callback) {
  socket.emit('request', request, callback);
}

class Connection {
  __missingInit = true;
  __namespace = null;

  init({ onConnect, onDisconnect, onError, onMessage }) {
    this.__onConnect = onConnect;
    this.__onDisconnect = onDisconnect;
    this.__onError = onError;
    this.__onMessage = onMessage;

    this.__missingInit = false;
  }

  __getNamespace() {
    if (this.__namespace) {
      return this.__namespace;
    }

    const ns = {
      socket: io(window.location.origin, {
        path: '/api/live/ws/',
      }),
      /* Arrays for reconnections: */
      subscriptions: [],
      unsubscriptions: [],
    };

    this.__namespace = ns;

    ns.socket.on('connect', () => {
      __join(ns.socket, ns.subscriptions);
      __leave(ns.socket, ns.unsubscriptions);
      ns.unsubscriptions = [];
      this.__onConnect();
    });
    ns.socket.on('disconnect', this.__onDisconnect);
    // ns.socket.on('connect_error', this.__onError);
    ns.socket.on('notification', this.__onMessage);
    ns.socket.on('response', this.__onMessage);

    return ns;
  }

  getStatus() {
    const { socket } = this.__getNamespace();
    return {
      connected: socket.connected,
      disconnected: socket.disconnected,
    };
  }

  request(message) {
    if (this.__missingInit) {
      throw new Error('Connection not initialized')
    };

    const { socket } = this.__getNamespace();
    if (socket.connected) {
      return new Promise((resolve, reject) => {
        const cb = (response) =>
          response?.error ? reject(response) : resolve(response);

        __request(socket, message, cb);
      });
    }

    return this.requestWithHttp(message);
  }

  requestWithHttp(message) {
    const { type } = message;

    if (type in TYPE_HTTP_REQUEST_MAP) {
      const httpFn = TYPE_HTTP_REQUEST_MAP[type];
      const httpPromise = httpFn(message);

      return httpPromise;
    }

    throw new Error(`Unknown request type "${type}"`);
  }

  subscribe({ rooms }) {
    const ns = this.__getNamespace();
    const subscriptions = [...ns.subscriptions, ...rooms];
    const unsubscriptions = ns.unsubscriptions.filter(
      (sub) => !rooms.includes(sub)
    );

    Object.assign(ns, {
      subscriptions,
      unsubscriptions,
    });

    if (ns.socket.connected) {
      __join(ns.socket, rooms);
    }
  }

  unsubscribe({ rooms }) {
    const ns = this.__getNamespace();
    const subscriptions = ns.subscriptions.filter(
      (sub) => !rooms.includes(sub)
    );

    Object.assign(ns, {
      subscriptions,
    });

    if (ns.socket.connected) {
      __leave(ns.socket, rooms);
    } else {
      Object.assign(ns, {
        unsubscriptions: [...ns.unsubscriptions, ...rooms],
      });
    }
  }

  unsubscribeAll() {
    const ns = this.__getNamespace();
    const { subscriptions } = ns;

    Object.assign(ns, { subscriptions: [] });

    if (ns.socket.connected) {
      __leave(ns.socket, subscriptions);
    } else {
      Object.assign(ns, {
        unsubscriptions: [...ns.unsubscriptions, ...subscriptions],
      });
    }
  }
}


export default new Connection();
