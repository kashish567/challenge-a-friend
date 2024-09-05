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
    <div className="h-screen w-screen bg-greybg flex flex-col justify-center items-center">
      <div className="-rotate-6 bg-yellowbg border border-black rounded-3xl w-1/2">
      {/* <div className="p-6 bg-yellowbg border-[2px] border-black rounded-3xl flex flex-col justify-center items-center mb-6  w-1/2">
        <h1 className="text-3xl font-semibold">Challenge a Friend!</h1>
      </div> */}
      <div className="rotate-6 p-6 py-8 bg-greybg border-[2px] border-black rounded-3xl w-full flex flex-col justify-center items-center gap-4">
      <h1 className="text-3xl font-semibold">Challenge a Friend!</h1>
      <span className="text-3xl font-semibold">------------------------------------</span>
        <div className="flex flex-col justify-center items-center gap-4">
          <h2 className="text-xl font-semibold text-center">
            Create a New Room
          </h2>
          <Link href="/create-room">
            <Button className="rounded-full">Create</Button>
          </Link>
        </div>

        <div className="w-full px-6 border flex flex-col gap-4 justify-center items-center">
          <h2 className="text-xl font-semibold">Available Rooms</h2>
          {rooms.length === 0 ? (
            <p>No rooms available.</p>
          ) : (
            <table className="w-full px-6 border border-black">
              <tr className="font-semibold border border-black w-full mb-2">
                <th className="border border-black">Room Code</th>
                <th className="border border-black">Player Count / Max Players</th>
                <th className="border border-black">Join</th>
              </tr>
              {rooms.map((room) => (
                <tr
                  key={room.code}
                  className="w-full border border-black mb-2"
                >
                  <td className="border border-black text-center">{room.code}</td>
                  <td className="border border-black text-center">{room.playerCount}/2</td>
                  <td className="border border-black text-center">
                    <Link href={`/join-room/${room.code}`}>
                      <Button className="rounded-full">Join</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </table>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ChallengeAFriend;
