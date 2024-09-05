"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Home = () => {
  return (
    <div className="h-screen w-screen bg-greybg flex flex-col justify-center items-center">
      <div className="-rotate-6 bg-yellowbg rounded-3xl border border-black">
        <div className="rotate-6 p-6 min-h-[15rem] min-w-[25rem] bg-greybg rounded-3xl border-[2px] border-black flex flex-col justify-center items-center">
        <h1 className="text-2xl font-semibold mb-4">
          Welcome to the Quiz Game!
        </h1>
        <Link href="/challenge-a-friend">
          <Button className="mt-4 rounded-full">Challenge a Friend!</Button>
        </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
