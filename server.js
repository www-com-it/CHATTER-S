const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let waitingUsers = [];

io.on('connection', (socket) => {
  console.log('Utente connesso:', socket.id);
  waitingUsers.push(socket);

  if (waitingUsers.length >= 2) {
    const user1 = waitingUsers.shift();
    const user2 = waitingUsers.shift();

    const roomId = `room-${user1.id}-${user2.id}`;
    user1.join(roomId);
    user2.join(roomId);

    user1.emit('matched', { roomId });
    user2.emit('matched', { roomId });
  }

  socket.on("message", ({ roomId, text }) => {
  // Invia il messaggio a tutti tranne chi lo ha inviato
  socket.to(roomId).emit("message", { text });
});

  socket.on('disconnect', () => {
    waitingUsers = waitingUsers.filter(s => s.id !== socket.id);
    console.log('Utente disconnesso:', socket.id);
  });

  socket.on("leaveRoom", (roomId) => {
  socket.leave(roomId);
  socket.to(roomId).emit("message", { text: "L'altro utente ha terminato la chat." });
});
});



server.listen(3000, () => console.log('Server avviato su http://localhost:3000'));