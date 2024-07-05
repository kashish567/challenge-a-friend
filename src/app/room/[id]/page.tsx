'use client';
import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface Params{
    id: string;
}


const Room = ({params}:{params:Params}) => {
    const [username, setUsername] = useState("");
  return (
    <div className="h-screen w-screen bg-[#dbd9e3] flex flex-col justify-center items-center">
      <div className="p-6 bg-[#f0bf4c] rounded-md shadow-md shadow-black ">
        <div className="flex flex-col font-semibold" >
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            className="mb-2 rounded-sm h-8 p-2"
            value={username}
            onChange={(e) => setUsername(e.target?.value)}
          />
          <Link href={`/room/${params.id}/${username}`} className='flex items-center justify-center' ><Button  className="mt-4">
            Join Room
          </Button>
          </Link>
        </div>
      </div>

      
    </div>
  )
}

export default Room
