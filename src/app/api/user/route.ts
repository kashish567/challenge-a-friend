import { NextRequest, NextResponse } from "next/server";
import Challenge from "@/schema/userSchema"; // Fixed typo in import
import dbConnect from "@/db/db";
import Room from "@/schema/roomSchema";

export const POST = async (req: NextRequest) => {
  try {
    // Connect to the database
    await dbConnect();

    let roomCode: number | null = null;
    let isUnique = false;

    // Parse the request body
    const body = await req.json();
    const { username } = body;

    // Validate the presence of username
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Check if the user exists in the Challenge collection
    const user = await Challenge.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: "User does not exist", user: false },
        { status: 404 }
      );
    }

    while (!isUnique) {
      roomCode = generateNumericRoomCode(); // Generate room code
      isUnique = await isRoomCodeUnique(roomCode); // Ensure it's unique
    }

    // Respond with success and return the user's edcoins
    return NextResponse.json(
      { success: true, user: true, edcoins: user.edcoins || 0, roomCode: roomCode },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

function generateNumericRoomCode(): number {
  return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit room code
}

async function isRoomCodeUnique(roomCode: number): Promise<boolean> {
  const room = await Room.findOne({ roomCode });
  return !room; // Return true if no room exists with the code
}

export const PUT = async (req: NextRequest) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { username1, username2, entryCost, winnerUsername, winnerPrize } =
      body;

    if (!username1 && !username2) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const user1 = username1
      ? await Challenge.findOne({ username: username1 })
      : null;
    const user2 = username2
      ? await Challenge.findOne({ username: username2 })
      : null;

    if (!user1 && !user2) {
      return NextResponse.json(
        { error: "User does not exist", user: false },
        { status: 404 }
      );
    }

    // Check if the last update (based on updatedAt) was within 1 minute
    // const oneMinute = 60000;
    // const now = new Date().getTime();
    // const lastUpdated1 = user1.updatedAt
    //   ? new Date(user1.updatedAt).getTime()
    //   : 0;
    // const lastUpdated2 = user2.updatedAt
    //   ? new Date(user2.updatedAt).getTime()
    //   : 0;

    // if (now - lastUpdated1 < oneMinute && now - lastUpdated2 < oneMinute) {
    //   return NextResponse.json(
    //     { error: "You can only update once per minute" },
    //     { status: 429 }
    //   );
    // }

    if (entryCost) {
      // Proceed with updating edcoins and set updatedAt automatically
      user1.edcoins -= 100;
      user2.edcoins -= 100;
      await user1.save();
      await user2.save();
    }

    if (winnerPrize && username1 == winnerUsername) {
      user1.edcoins += 200;
      await user1.save();
    }
    if (winnerPrize && username2 == winnerUsername) {
      user2.edcoins += 200;
      await user2.save();
    }

    return NextResponse.json(
      {
        success: true,
        user: true,
        user1edcoins: user1.edcoins,
        user2edcoins: user2.edcoins,
        // winnerEdcoins: winner.edcoins
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
