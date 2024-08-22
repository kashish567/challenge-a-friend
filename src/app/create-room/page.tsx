"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { Socket, io } from "socket.io-client";
import axios from "axios";

let socket: Socket;

const CreateRoom = () => {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomLink, setRoomLink] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    socket = io("http://localhost:3000");

    return () => {
      socket.disconnect();
    };
  }, []);

  const checkUserExists = async (username: string) => {
    try {
      const response = await axios.post("http://localhost:3000/api/user", {
        username,
      });

      // Check if the response status is 200, indicating the user exists
      return response.data.success;
    } catch (error:any) {
      if (error.response && error.response.status === 404) {
        // Handle case where the user does not exist
        console.error("User does not exist:", error.response.data);
      } else {
        console.error("Error checking user existence:", error.message);
      }
      return false; // Return false if any error occurs or user is not found
    }
  };

  const createRoomLink = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("roomCode", roomCode, "username", username);

    const userExists = await checkUserExists(username);

    // Prevent room creation if the user does not exist
    if (!userExists) {
      setErrorMessage("Username not registered. Please register first.");
      return;
    }

    socket.emit("createRoom", roomCode, username);
    setRoomLink(`http://localhost:3000/room/${roomCode}/`);
    setErrorMessage(""); // Clear any previous error messages
  };

  return (
    <div className="h-screen w-screen bg-[#dbd9e3] flex flex-col justify-center items-center">
      <div className="p-6 bg-[#f0bf4c] rounded-md shadow-md shadow-black">
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
            Create Room Link
          </Button>
        </form>

        {errorMessage && (
          <div className="mt-4 text-red-600 font-semibold">{errorMessage}</div>
        )}

        {roomLink && (
          <div className="bg-[#f0bf4c] h-auto w-auto p-6 rounded-md m-6 shadow-md shadow-black">
            <div className="mt-4 flex flex-col items-center justify-center gap-4">
              <h1 className="font-semibold">
                {username.toUpperCase()} share this with your friend
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
