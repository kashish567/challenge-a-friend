"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { Socket, io } from "socket.io-client";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

let socket: Socket;

const CreateRoom = () => {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomLink, setRoomLink] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [edcoins, setEdcoins] = useState<number | null>(null); // State to store edcoins
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([
    "bollywood",
    "food",
    "history",
    "cricket",
    "tech",
  ]);

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

      // Check if the response indicates success and user existence
      if (response.data.success && response.data.user) {
        setEdcoins(response.data.edcoins); // Set edcoins state
        setRoomCode(response.data.roomCode);
        return response.data.roomCode;
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error("User does not exist:", error.response.data);
      } else {
        console.error("Error checking user existence:", error.message);
      }
    }
    return false; // Return false if any error occurs or user is not found
  };

  const createRoomLink = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("username", username, "edcoins", edcoins);
    console.log("selcted category", selectedCategory)

    const generatedRoomCode = await checkUserExists(username);
    console.log("generatedRoomCode:",generatedRoomCode)

    // Prevent room creation if the user does not exist or edcoins are not sufficient
    if (!generatedRoomCode) {
      setErrorMessage("Username not registered. Please register first.");
      return;
    }

    // if (edcoins === null || edcoins <= 100) {
    //   setErrorMessage("You need more than 100 edcoins to create a room.");
    //   return;
    // }

    socket.emit("createRoom", generatedRoomCode, username, selectedCategory);
    setRoomLink(`http://localhost:3000/room/${generatedRoomCode}/`);
    setErrorMessage(""); // Clear any previous error messages
  };

  return (
    <div className="h-screen w-screen bg-greybg flex flex-col justify-center items-center">
      <div className="-rotate-6 bg-yellowbg rounded-3xl border border-black">
        <div className="rotate-6 bg-greybg rounded-3xl flex flex-col justify-center items-center border-[2px] border-black p-6  min-h-[17rem] min-w-[30rem]">
          <form
            className="flex flex-col font-semibold w-full p-4"
            onSubmit={createRoomLink}
          >
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              name="username"
              className="mb-2 rounded-full h-8 p-2"
              value={username}
              onChange={(e) => setUsername(e.target?.value)}
            />
            <label htmlFor="roomcode">Room Code:</label>
            <input
              type="text"
              name="roomcode"
              className="mb-2 rounded-full h-8 p-2"
              value={roomCode}
              readOnly
              onChange={(e) => setRoomCode(e.target?.value)}
            />

            <Select onValueChange={(value) => setSelectedCategory(value)}>
              <SelectTrigger className="w-[180px] rounded-3xl">
                <SelectValue placeholder="Quiz Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.replace(/^./, category[0].toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Display edcoins */}
            {edcoins != null && (
              <div className="mt-4 text-green-600 font-semibold">
                Available Edcoins: {edcoins}
              </div>
            )}

            <Button type="submit" className="mt-4 rounded-full">
              Create Room Link
            </Button>
          </form>

          {errorMessage && (
            <div className="mt-4 text-red-600 font-semibold">
              {errorMessage}
            </div>
          )}

          {roomLink && edcoins !== null && edcoins >= 100 ? (
            <div className="h-auto w-auto p-4">
              <div className="mt-4 flex flex-col items-center justify-center gap-4">
                <h1 className="font-semibold">
                  {username.toUpperCase()} share this with your friend
                </h1>
                <p className="text-xl">Room Link: {roomLink}</p>

                <Link href={`/room/${roomCode}/${username}`}>
                  <Button className="rounded-full">Join Room</Button>
                </Link>
              </div>
            </div>
          ) : edcoins !== null && edcoins <= 100 ? (
            <div className="mt-4 text-red-600 font-semibold">
              {"You need more than 100 edcoins to create a room."}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
