import { NextRequest, NextResponse } from "next/server";
import Room from "@/schema/roomSchema";
import dbConnect from "@/db/db";

export const POST = async (req: NextRequest) => {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await req.json();
    const {
      roomCode,
      roomCreatedBy,
      player1Name,
      player2Name,
      playerCount,
      playerIds,
      category,
      winner,
    } = body;

    // Validate the presence of username
    if (!roomCode) {
      return NextResponse.json(
        { error: "roomCode is required" },
        { status: 400 }
      );
    }

    // Check if the user exists in the Challenge collection
    const room = await Room.findOne({ roomCode });

    if (room) {
      return NextResponse.json(
        { error: "room does already exist", room: true },
        { status: 404 }
      );
    } else {
      await Room.create({
        roomCode,
        roomCreatedBy,
        player1Name,
        player2Name,
        playerCount,
        playerIds,
        category,
        winner,
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
