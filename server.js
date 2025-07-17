const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Action');

const app = express();
app.use(cors()); // Allow CORS

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // React app URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.static('build'));

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId],
    };
  });
}

io.on('connection', (socket) => {
  console.log('socket connected...', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // code change write
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code}) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  })

  // code new user same write code seen
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    if (socketId && code) {
      io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    }
  });

    // Disconnected
  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });

});




const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
