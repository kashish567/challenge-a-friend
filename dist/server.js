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
let rooms = {};
let users = {};
let quizStarted = false;
let scores = { player1: 0, player2: 0 };
let questions = [];

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
    console.log("A user connected", socket.id);

    socket.on("userJoinedQuizRoom", (roomCode, username) => {
      console.log("user joined quiz room", roomCode, username);
      socket.join(roomCode);

      io.to(roomCode).emit("roomState", rooms[roomCode]);

      if (rooms[roomCode].playerCount === 2) {
        console.log("Two players joined, starting quiz");
        quizStarted = true;
        questions = [...data.questions]
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
        io.to(roomCode).emit("startQuiz", questions);
      }
    });

    socket.on("createRoom", (roomCode, username) => {
      console.log("Create room request received");
      rooms[roomCode] = { players: [socket.id], playerCount: 1 };
      users[socket.id] = { room: roomCode, username };

      socket.join(roomCode);
      console.log({ rooms });

      io.emit(
        "roomList",
        Object.keys(rooms).map((code) => ({
          code,
          playerCount: rooms[code].playerCount,
        }))
      );
    });

    socket.on("joinRoom", (roomCode, username) => {
      console.log(
        `Join request received: Room Code - ${roomCode}, Username - ${username}`
      );
      if (rooms[roomCode] && rooms[roomCode].playerCount < 2) {
        rooms[roomCode].players.push(socket.id);
        rooms[roomCode].playerCount++;

        users[socket.id] = { room: roomCode, username };
        socket.join(roomCode);

        // Emit room state to all clients in the room
        // io.to(roomCode).emit("roomState", rooms[roomCode]);
        io.to(socket.id).emit("roomState", rooms[roomCode]);

        if (rooms[roomCode].playerCount === 2) {
          console.log("Two players joined, starting quiz");
          quizStarted = true;
          questions = [...data.questions]
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
          io.to(socket.id).emit("startQuiz", questions);
        }
      }
    });

    socket.on("getRooms", () => {
      console.log("Get rooms request received");
      console.log({ rooms });
      socket.emit(
        "roomList",
        Object.keys(rooms).map((code) => ({
          code,
          playerCount: rooms[code].playerCount,
        }))
      );
    });

    // socket.on("initiateQuiz", () => {
    //   console.log("Start quiz request received");
    //   io.emit("startQuiz", { quizStarted: true });
    // });

    socket.on("updateScore", (score) => {
      console.log("Update Score received!");
      let player = Object.keys(users).find(
        (key) => users[key].room === users[socket.id].room && key === socket.id
      );
      if (player) {
        scores[player] = score;
        io.to(users[socket.id].room).emit("scoreUpdate", scores);
      }
    });

    socket.on("disconnect", () => {
      console.log("disconnect quiz request received");
      // let roomCode = users[socket.id]?.room;
      // if (roomCode) {
      //   rooms[roomCode].players = rooms[roomCode].players.filter(
      //     (player) => player !== socket.id
      //   );
      //   rooms[roomCode].playerCount--;
      //   delete users[socket.id];
      //   if (rooms[roomCode].playerCount === 0) {
      //     delete rooms[roomCode];
      //   }
      // }
      console.log({ rooms });
      // io.emit(
      //   "roomList",
      //   Object.keys(rooms).map((code) => ({
      //     code,
      //     playerCount: rooms[code].playerCount,
      //   }))
      // );
      console.log("A user disconnected", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
