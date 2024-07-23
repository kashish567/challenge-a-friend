"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import io, { Socket } from "socket.io-client";

interface Room {
  code: string;
  playerCount: number;
}

const ChallengeAFriend = () => {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const socket: Socket = io("http://localhost:3000");

    socket.on("roomList", (roomList: Room[]) => {
      setRooms(roomList);
      console.log({ roomList });
    });

    socket.emit("getRooms");

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#dbd9e3] flex flex-col justify-center items-center">
      <div className="p-6 bg-[#f0bf4c] rounded-md shadow-md shadow-black mb-6  w-1/2">
        <h1 className="text-3xl font-semibold mb-4 text-center">
          Challenge a Friend!
        </h1>
      </div>
      <div className="p-6 bg-[#f0bf4c] rounded-md shadow-md shadow-black w-1/2">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Create a New Room
          </h2>
          <Link href="/create-room">
            <Button>Create</Button>
          </Link>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">
            Available Rooms
          </h2>
          {rooms.length === 0 ? (
            <p>No rooms available.</p>
          ) : (
            <ul>
              {rooms.map((room) => (
                <li
                  key={room.code}
                  className="flex justify-between items-center mb-2"
                >
                  <span>{room.code}</span>
                  <span>{room.playerCount}/2</span>
                  <Link href={`/join-room/${room.code}`}>
                    <Button>Join</Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeAFriend;
