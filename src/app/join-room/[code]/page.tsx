"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router"; // Corrected import
import { Socket, io } from "socket.io-client";
import axios from "axios";

let socket: Socket;

interface Params {
  code: string;
}

const JoinRoom = ({ params }: { params: Params }) => {
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter(); // Renamed for clarity

  useEffect(() => {
    socket = io("http://localhost:3000");

    return () => {
      socket.disconnect();
    };
  }, []);

  const checkUserExists = async (username: string) => {
    try {
      const response = await axios.post("http://localhost:3000/api/user", {
        username, // Fixed typo in the route
      });
      return response.data.user;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  const onJoinRoomClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    const userExists = await checkUserExists(username);
    if (!userExists) {
      setErrorMessage("Username not registered. Please register first.");
      return;
    }

    socket.emit("joinRoom", params.code, username);
    router.push(`/room/${params.code}/${username}`); // Fixed template literal
  };

  return (
    <div className="h-screen w-screen bg-[#dbd9e3] flex flex-col justify-center items-center">
      <div className="p-6 bg-[#f0bf4c] rounded-md shadow-md shadow-black">
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
          {errorMessage && (
            <div className="mt-4 text-red-600 font-semibold">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
