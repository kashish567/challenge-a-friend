"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Corrected import
import { Socket, io } from "socket.io-client";
import axios from "axios";

// let socket: Socket;

interface Params {
  code: string;
}

const JoinRoom = ({ params }: { params: Params }) => {
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [edcoins, setEdcoins] = useState<number | null>(null); // State to store edcoins
  const router = useRouter(); // Renamed for clarity
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io("http://localhost:3000");

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  const checkUserExists = async (username: string) => {
    try {
      const response = await axios.post("http://localhost:3000/api/user", {
        username,
      });

      // Check if the user exists and set the edcoins if they do
      if (response.data.user) {
        setEdcoins(response.data.edcoins || 0); // Set edcoins state
        return true;
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
    }
    return false;
  };

  const onJoinRoomClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    const userExists = await checkUserExists(username);
    if (!userExists) {
      setErrorMessage("Username not registered. Please register first.");
      return;
    }

     // Ensure the socket is initialized before emitting
     if (socket.current) {
      socket.current.emit("joinRoom", params.code, username);
      router.push(`/room/${params.code}/${username}`);
    } else {
      setErrorMessage("Unable to connect to the server.");
    }
    // socket.emit("joinRoom", params.code, username);
    // router.push(`/room/${params.code}/${username}`);
  };

  return (
    <div className="h-screen w-screen bg-greybg flex flex-col justify-center items-center">
      <div className="-rotate-6 border border-black bg-yellowbg rounded-3xl">
        <div className="rotate-6 min-h-[12rem] min-w-[20rem] bg-greybg rounded-3xl border-[2px] border-black p-6 flex flex-col justify-center items-center font-semibold">
          <div>
            <label htmlFor="username">Username :</label>
            <input
              type="text"
              name="username"
              className="mb-2 rounded-full h-8 p-2 mx-2"
              value={username}
              onChange={(e) => setUsername(e.target?.value)}
            />
          </div>
          {/* Display edcoins */}
          {edcoins !== null && (
            <div className="mt-4 text-green-600 font-semibold">
              Available Edcoins: {edcoins}
            </div>
          )}
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

export default JoinRoom;
