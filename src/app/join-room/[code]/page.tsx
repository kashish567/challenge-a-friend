"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { Socket, io } from "socket.io-client";

let socket: Socket;

interface Params {
  code: string;
}

const JoinRoom = ({ params }: { params: Params }) => {
  const [username, setUsername] = useState("");

  const history = useRouter();

  useEffect(() => {
    socket = io("http://localhost:3000");

    return () => {
      socket.disconnect();
    };
  }, []);

  const onJoinRoomClick = (e: any) => {
    socket.emit("joinRoom", params.code, username);
    history.push(`/room/${params.code}/${username}`);
  };

  return (
    <div className="h-screen w-screen bg-[#dbd9e3] flex flex-col justify-center items-center">
      <div className="p-6 bg-[#f0bf4c] rounded-md shadow-md shadow-black ">
        <div className="flex flex-col font-semibold">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            className="mb-2 rounded-sm h-8 p-2"
            value={username}
            onChange={(e) => setUsername(e.target?.value)}
          />
          <div className="flex items-center justify-center">
            <Button onClick={onJoinRoomClick} className="mt-4">
              Join Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
