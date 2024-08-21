import { NextRequest, NextResponse } from "next/server";
import Challenge from "@/schema/userSchema"; // Fixed typo in import
import dbConnect from "@/db/db";

export const POST = async (req: NextRequest) => {
    try {
        // Connect to the database
        await dbConnect();
        
        // Parse request body
        const body = await req.json();
        const { username, edcoins } = body;

        // Validate input
        if (!username || edcoins === undefined || edcoins === null) {
            return NextResponse.json({ error: "Username and Edcoins are required" }, { status: 400 });
        }

        // Create a new Challenge instance and save it
        const challenge = new Challenge({ username, edcoins });
        await challenge.save();

        // Send success response
        return NextResponse.json({ success: true }, { status: 201 });
        
    } catch (error: any) {
        // Handle errors
        console.error(`Error: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};
