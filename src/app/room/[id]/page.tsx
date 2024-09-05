"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Socket, io } from "socket.io-client";
import { useRouter } from "next/navigation";
import axios from "axios";

let socket: Socket;

interface Params {
  id: string;
}

const Room = ({ params }: { params: Params }) => {
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
      return response.data.success;
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

    socket.emit("joinRoom", params.id, username);
    router.push(`/room/${params.id}/${username}`); // Corrected template literal
  };

  return (
    <div className="h-screen w-screen bg-greybg flex flex-col justify-center items-center">
      <div className="-rotate-6 border border-black bg-yellowbg rounded-3xl">
        <div className="rotate-6 min-h-[15rem] min-w-[25rem] bg-greybg rounded-3xl border-[2px] border-black p-6 flex flex-col justify-center items-center font-semibold">
          <div className="w-full flex justify-center items-center">
            <label htmlFor="username">Username :</label>
            <input
              type="text"
              name="username"
              className="mb-2 rounded-full h-8 p-2 mx-2"
              value={username}
              onChange={(e) => setUsername(e.target?.value)}
            />
          </div>
          <div className="flex items-center justify-center">
            <Button onClick={onJoinRoomClick} className="mt-4 rounded-full">
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

export default Room;
