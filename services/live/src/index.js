const http = require('http');

const express = require('express');
const socketio = require('socket.io');

const { request } = require('./requests');

const EMITTABLE_REQUEST_TYPES = ['create', 'delete', 'update'];

const app = express();

const server = http.createServer(app);
const io = new socketio.Server(server, {
  cors: {
    origin: true,
  },
  path: '/ws',
});

io.on('connection', (socket) => {
  socket.on('join', ({ rooms }) => {
    rooms.forEach((room) => socket.join(room));
  });

  socket.on('leave', ({ rooms }) => {
    rooms.forEach((room) => socket.leave(room));
  });

  socket.on('notify', (message) => {
    const { array = [], meta, type } = message;

    if (array.length === 0) {
      const { payload, room } = message;
      array.push({ payload, room });
    }

    array.forEach(({ payload, room }) =>
      socket.to(room).emit('notification', { meta, payload, type })
    );
  });

  socket.on('request', async (message, cb) => {
    const { meta, room, type, ...requestArgs } = message;

    try {
      const payload = await request({ type, ...requestArgs });
      cb(payload);

      const emittable = EMITTABLE_REQUEST_TYPES.includes(type);
      if (emittable && room) {
        socket.to(room).emit('response', { meta, payload, type });
      }
    } catch (error) {
      cb({ error });
    }
  });
});

server.listen(3000, () => {
  console.log('Gateway host:', process.env.GATEWAY_HOST);
  console.log('listening on *:3000');
});
