"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useState } from "react";

const Home = () => {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomLink, setRoomLink] = useState("");

  const createRoomLink = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("roomCode", roomCode, "username", username)
    setRoomLink(`http://localhost:3000/room/${roomCode}`);
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
          <label htmlFor="username">Room Code</label>
          <input
            type="text"
            name="roomcode"
            className="mb-2 rounded-sm h-8 p-2"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target?.value)}
          />
          <Button type="submit" className="mt-4">
            Create Room Link
          </Button>
        </form>
      </div>

      {roomLink && (
        <div className="bg-[#f0bf4c] h-auto w-auto p-6 rounded-md m-6 shadow-md shadow-black">
          <div className="mt-4 flex flex-col items-center justify-center gap-4">
            <h1 className="font-semibold">
              {username.toUpperCase()} share this to the your friend to
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
  );
};

export default Home;
