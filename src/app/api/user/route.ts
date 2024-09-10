import { NextRequest, NextResponse } from "next/server";
import Challenge from "@/schema/userSchema"; // Fixed typo in import
import dbConnect from "@/db/db";

export const POST = async (req: NextRequest) => {
  try {
    // Connect to the database
    await dbConnect();

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

    // Respond with success and return the user's edcoins
    return NextResponse.json(
      { success: true, user: true, edcoins: user.edcoins || 0 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

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
    const winner = winnerUsername
      ? await Challenge.findOne({ username: winnerUsername })
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

    if (winnerPrize) {
      winner.edcoins += 200;
      await winner.save();
    }

    return NextResponse.json(
      {
        success: true,
        user: true,
        user1edcoins: user1.edcoins,
        user2edcoins: user2.edcoins,
        winnerEdcoins: winner.edcoins
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
