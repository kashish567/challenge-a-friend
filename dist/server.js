import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import data from "../src/data.json" assert { type: "json" };
import axios from "axios";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev });
const handler = app.getRequestHandler();

let io;
let rooms = {};
let users = [];
let quizStarted = false;
//let scores = { player1: 0, player2: 0 };
let scores = {};
let questions = [];
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
    console.log("A user connected", socket.id);

    socket.on("userJoinedQuizRoom", async (roomCode, username) => {
      console.log("user joined quiz room", roomCode, username);
      users.push(username);
      console.log("users array", users);
      //ch
      if (!rooms[roomCode]) {
        console.log(`Room ${roomCode} does not exist`);
        return;
      }

      socket.join(roomCode);
      rooms[roomCode].playerName = {
        user1: users[0],
        user2: users[1],
      };
      console.log("rooms[roomCode]:", rooms[roomCode]);
      io.to(roomCode).emit("roomState", rooms[roomCode]);

      if (rooms[roomCode].playerCount === 2) {
        console.log("Two players joined, starting quiz");
        quizStarted = true;
        try {
          const response = await axios.put(`http://localhost:3000/api/user`, {
            username1: users[0],
            username2: users[1],
            entryCost: true,
            winnerUsername: "",
            winnerPrize: false,
          });
          console.log("User updated:", response.data);
        } catch (error) {
          console.error("Error checking user existence:", error);
        }
        // questions = [...data.questions]
        //   .sort(() => 0.5 - Math.random())
        //   .slice(0, 5);
        // io.to(roomCode).emit("startQuiz", questions);

        // Use the selected category to filter questions
        const selectedCategory = rooms[roomCode].category;
        if (selectedCategory) {
          questions = [...data.questions]
            .filter((q) => q.category === selectedCategory)
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
          console.log("~~~~~startQuiz", questions);
          io.to(roomCode).emit("startQuiz", questions);
        } else {
          console.log("No category selected for this room");
        }
      }
    });

    socket.on("createRoom", (roomCode, username, selectedCategory) => {
      console.log("Create room request received");
      rooms[roomCode] = { players: [socket.id], playerCount: 1 };
      rooms[roomCode].category = selectedCategory;
      // users[roomCode] = { username };

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

    socket.on("joinRoom", async (roomCode, username) => {
      console.log(
        `Join request received: Room Code - ${roomCode}, Username - ${username}`
      );

      if (!rooms[roomCode] || rooms[roomCode].playerCount >= 2) {
        console.log(`Room ${roomCode} is either full or does not exist`);
        return;
      }

      rooms[roomCode].players.push(socket.id);
      rooms[roomCode].playerCount++;

      // users[socket.id] = { room: roomCode, username };
      socket.join(roomCode);

      // Emit room state to all clients in the room
      // io.to(roomCode).emit("roomState", rooms[roomCode]);
      io.to(socket.id).emit("roomState", rooms[roomCode]);

      if (rooms[roomCode].playerCount === 2) {
        console.log("Two players joined, starting quiz");
        quizStarted = true;
        // questions = [...data.questions]
        //   .sort(() => 0.5 - Math.random())
        //   .slice(0, 5);
        // io.to(socket.id).emit("startQuiz", questions);

        // Use the selected category to filter questions
        const selectedCategory = rooms[roomCode].category;
        if (selectedCategory) {
          questions = [...data.questions]
            .filter((q) => q.category === selectedCategory)
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
          console.log("~~~~~startQuiz", questions);
          io.to(roomCode).emit("startQuiz", questions);
        } else {
          console.log("No category selected for this room");
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

    socket.on("updateScore", (score, roomId, playerNumber) => {
      console.log("Update Score received!", score, roomId, playerNumber);
      //const userRoom = users[socket.id]?.room;
      console.log({ userRoom: roomId });

      if (roomId && rooms[roomId]) {
        // let player = Object.keys(users).find(
        //   (key) => users[key].room === userRoom && key === socket.id
        // );
        // console.log("Player found:", player);

        // if (player) {
        console.log({ scores });
        if (scores[roomId]) {
          scores[roomId][playerNumber] = score;
        } else {
          scores[roomId] = {
            [playerNumber]: score,
          };
        }
        console.log({ scores });
        io.to(roomId).emit("scoreUpdate", scores[roomId]);
        // }
      } else {
        console.log("User room or room not found for socket ID:", socket.id); //change
      }
    });

    socket.on("quizEnd", (roomId, playerNumber) => {
      console.log("Quiz end received for player:", playerNumber);
      if (!finishedPlayers[roomId]) {
        finishedPlayers[roomId] = {};
      }
      finishedPlayers[roomId][playerNumber] = true;
      if (finishedPlayers[roomId].player1 && finishedPlayers[roomId].player2) {
        console.log("Both players finished. Showing results...");
        io.to(roomId).emit("showResults", scores[roomId]);
      } else {
        socket.emit("waitingForOpponent");
      }
    });

    socket.on("disconnect", () => {
      console.log("disconnect quiz request received");
      // let roomCode = users[socket.id]?.room;
      // if (roomCode && rooms[roomCode]) { //change
      //   rooms[roomCode].players = rooms[roomCode].players.filter(
      //     (player) => player !== socket.id
      //   );
      //   rooms[roomCode].playerCount--;
      //   delete users[socket.id];

      //   if (rooms[roomCode].playerCount === 0) {
      //     delete rooms[roomCode];
      //   }

      console.log({ rooms });

      //   io.emit(
      //     "roomList",
      //     Object.keys(rooms).map((code) => ({
      //       code,
      //       playerCount: rooms[code].playerCount,
      //     }))
      //   );
      // }

      // console.log({ rooms });
      console.log("A user disconnected", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
