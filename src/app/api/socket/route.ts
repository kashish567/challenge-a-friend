import { Server, Socket } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServer } from 'http';

let io: Server;
let users = 0;
let quizStarted = false;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!io) {
    const httpServer = createServer((_req, _res) => {
      _res.writeHead(200);
      _res.end('socket.io server');
    });

    io = new Server(httpServer, {
      cors: {
        origin: '*',
      },
    });

    io.on('connection', (socket: Socket) => {
      users++;
      console.log('a user connected', users);

      if (users === 2) {
        quizStarted = true;
        io.emit('startQuiz');
      }

      socket.on('disconnect', () => {
        users--;
        if (users < 2) {
          quizStarted = false;
          io.emit('resetQuiz');
        }
        console.log('user disconnected', users);
      });
    });

    httpServer.listen(3000, () => {
      console.log('Socket.io server listening on *:3000');
    });
  }

  res.end('socket.io server');
}
