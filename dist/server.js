import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
import data from './src/data.json' assert { type: 'json' };

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev });
const handler = app.getRequestHandler();

let io;
let users = 0;
let quizStarted = false;
let scores = { player1: 0, player2: 0 };
let questions = [];
let players = {}; // To store the socket ids of the players

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handler(req, res);
  });

  io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    users++;
    console.log('a user connected', users);

    // Assign player1 or player2 based on connection order
    if (users === 1) {
      players.player1 = socket.id;
    } else if (users === 2) {
      players.player2 = socket.id;
      quizStarted = true;
      questions = [...data.questions].sort(() => 0.5 - Math.random()).slice(0, 5);
      io.emit('players', players); // Send players data to clients
      io.emit('startQuiz', questions);
    }

    socket.on('updateScore', (score) => {
      let player = Object.keys(players).find(key => players[key] === socket.id);
      if (player) {
        scores[player] = score;
        io.emit('scoreUpdate', scores);

        // Check if any player has reached a score of 50 (or any winning condition)
        if (scores[player] >= 50) {
          io.emit('gameOver', `${player} wins!`);
          resetGame();
        }
      }
    });

    socket.on('requestOpponentScore', () => {
      let currentPlayer = Object.keys(players).find(key => players[key] === socket.id);
      let opponentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
      io.to(socket.id).emit('opponentScore', scores[opponentPlayer]);
    });

    socket.on('disconnect', () => {
      users--;
      if (users < 2) {
        quizStarted = false;
        io.emit('resetQuiz');
        resetGame();
      }
      console.log('user disconnected', users);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

function resetGame() {
  scores = { player1: 0, player2: 0 };
  quizStarted = false;
  questions = [];
  players = {};
  io.emit('resetQuiz');
}
