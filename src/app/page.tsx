"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Home = () => {
  return (
    <div className="h-screen w-screen bg-[#dbd9e3] flex flex-col justify-center items-center">
      <div className="p-6 bg-[#f0bf4c] rounded-md shadow-md shadow-black ">
        <h1 className="text-2xl font-semibold mb-4">
          Welcome to the Quiz Game!
        </h1>
        <Link href="/challenge-a-friend">
          <Button className="mt-4">Challenge a Friend!</Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
