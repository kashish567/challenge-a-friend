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

export const PUT = async (req: NextRequest) => {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await req.json();
    const {
      roomCode,
      player1Name,
      player2Name,
      playerCount,
      playerIds,
      category,
      winner,
    } = body;

    // Validate the presence of roomCode
    if (!roomCode) {
      return NextResponse.json(
        { error: "roomCode is required" },
        { status: 400 }
      );
    }

    // Check if the room exists in the Room collection
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return NextResponse.json(
        { error: "Room does not exist", room: false },
        { status: 404 }
      );
    }

    // Update the room details if provided
    if (player1Name) room.player1Name = player1Name;
    if (player2Name) room.player2Name = player2Name;
    if (playerCount) room.playerCount = playerCount;
    if (playerIds) room.playerIds = playerIds;
    if (category) room.category = category;
    if (winner) room.winner = winner;

    // Save the updated room data
    await room.save();

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
