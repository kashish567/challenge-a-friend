import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/db/db";
import Challenge from "@/schema/userSchema"; // Fixed typo in import

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
    const userExists = await Challenge.findOne({ username });
    if (!userExists) {
      return NextResponse.json(
        { error: "User does not exist", user: false },
        { status: 404 }
      );
    }

    // Respond with success if the user exists
    return NextResponse.json({ success: true, user: true }, { status: 200 });
  } catch (error: any) {
    // Log the error and return a server error response
    console.error(`Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
