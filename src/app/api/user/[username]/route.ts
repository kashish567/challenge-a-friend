import { NextRequest, NextResponse } from "next/server";
import Challenge from "@/schema/userSchema"; 
import dbConnect from "@/db/db";

export const PUT = async (req: NextRequest, { params }: { params: { username: string } }) => {
  try {
    await dbConnect();

    const { username } = params;

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const user = await Challenge.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User does not exist", user: false }, { status: 404 });
    }

    // Check if the last update (based on updatedAt) was within 1 minute
    const oneMinute = 60000;
    const now = new Date().getTime();
    const lastUpdated = user.updatedAt ? new Date(user.updatedAt).getTime() : 0;

    if (now - lastUpdated < oneMinute) {
      return NextResponse.json({ error: "You can only update once per minute" }, { status: 429 });
    }

    // Proceed with updating edcoins and set updatedAt automatically
    user.edcoins -= 100;
    await user.save(); // This will also update the updatedAt field automatically

    return NextResponse.json({ success: true, user: true, edcoins: user.edcoins }, { status: 200 });

  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
