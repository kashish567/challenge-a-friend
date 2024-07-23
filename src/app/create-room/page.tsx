"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { Socket, io } from "socket.io-client";
import Room from "../room/[id]/page";

let socket: Socket;

const CreateRoom = () => {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomLink, setRoomLink] = useState("");

  useEffect(() => {
    socket = io("http://localhost:3000");
    // socket.on("createRoom", (roomList: Room[]) => {
    //   setRooms(roomList);
    //   console.log({ roomList });
    // });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoomLink = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("roomCode", roomCode, "username", username);
    setRoomLink(`http://localhost:3000/room/${roomCode}/`);
    socket.emit("createRoom", roomCode, username);
  };

  return (
    <div className="h-screen w-screen bg-[#dbd9e3] flex flex-col justify-center items-center">
      <div className="p-6 bg-[#f0bf4c] rounded-md shadow-md shadow-black ">
        <form className="flex flex-col font-semibold" onSubmit={createRoomLink}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            className="mb-2 rounded-sm h-8 p-2"
            value={username}
            onChange={(e) => setUsername(e.target?.value)}
          />
          <label htmlFor="roomcode">Room Code</label>
          <input
            type="text"
            name="roomcode"
            className="mb-2 rounded-sm h-8 p-2"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target?.value)}
          />
          <Button type="submit" className="mt-4">
            Generate Room Link
          </Button>
        </form>

        {roomLink && (
          <div className="bg-[#f0bf4c] h-auto w-auto p-6 rounded-md m-6 shadow-md shadow-black">
            <div className="mt-4 flex flex-col items-center justify-center gap-4">
              <h1 className="font-semibold">
                {username.toUpperCase()} share this with your friend to
                challenge him/her.
              </h1>
              <p className="text-xl">Room Link: {roomLink}</p>

              <Link href={`/room/${roomCode}/${username}`}>
                <Button>Join Room</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoom;
