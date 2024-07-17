import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import data from "./src/data.json" assert { type: "json" };

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev });
const handler = app.getRequestHandler();

let io;
let users = 0;
let quizStarted = false;
let scores = { player1: 0, player2: 0 };
let questions = [];
let players = {}; // To store the socket ids of the players
let finishedPlayers = {};

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handler(req, res);
  });

  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    users++;
    console.log("A user connected", users);

    if (users === 1) {
      players.player1 = socket.id;
    } else if (users === 2) {
      players.player2 = socket.id;
      quizStarted = true;
      questions = [...data.questions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
      io.emit("players", players);
      io.emit("startQuiz", questions);
      //console.log("Quiz started with questions:", questions);
    }

    socket.on("updateScore", (score) => {
      let player = Object.keys(players).find(
        (key) => players[key] === socket.id
      );
      if (player) {
        scores[player] = score;
        io.emit("scoreUpdate", scores);

        // Print players' scores to the console
        console.log(
          `Scores updated: Player 1 - ${scores.player1}, Player 2 - ${scores.player2}`
        );

        // if (scores[player] >= 50) {
        //   io.emit("gameOver", `${player} wins!`);
        // }
      }
    });

    socket.on("requestOpponentScore", () => {
      let currentPlayer = Object.keys(players).find(
        (key) => players[key] === socket.id
      );
      let opponentPlayer = currentPlayer === "player1" ? "player2" : "player1";
      io.to(socket.id).emit("opponentScore", scores[opponentPlayer] || 0);
    });

    socket.on("quizEnd", () => {
      let player = Object.keys(players).find(
        (key) => players[key] === socket.id
      );
      if (player) {
        finishedPlayers[player] = true;
        console.log("=====", finishedPlayers);
        if (finishedPlayers.player1 && finishedPlayers.player2) {
          console.log("GAME finished");
          io.emit("showResults", scores);
        } else {
          io.to(socket.id).emit("waitingForOpponent");
        }
      }
    });

    socket.on("disconnect", () => {
      users--;
      if (users < 2) {
        quizStarted = false;
        io.emit("resetQuiz");
      }
      console.log("A user disconnected", users);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
