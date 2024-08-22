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
