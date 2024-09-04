import { NextRequest, NextResponse } from "next/server";
import Challenge from "@/schema/userSchema"; // Fixed typo in import
import dbConnect from "@/db/db";

export const PUT = async (req: NextRequest, { params }: { params: { username: string } }) => {
  try {
    // Connect to the database
    await dbConnect();

    const { username } = params;
    // Parse the request body
    // const body = await req.json();
    // const { edcoins } = body;

    // Validate the presence of username
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Find the user and update edcoins
    const updatedUser = await Challenge.findOneAndUpdate(
      { username },
      { $inc: { edcoins: -100 } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User does not exist", user: false },
        { status: 404 }
      );
    }

    // Respond with success and return the user's edcoins
    return NextResponse.json(
      { success: true, user: true, edcoins: updatedUser.edcoins || 0 },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
