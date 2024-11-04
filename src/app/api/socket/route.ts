import { NextRequest, NextResponse } from 'next/server';

// No need for config export in the new structure

export async function POST(request: NextRequest) {
  // If you need to handle raw body data for Socket.IO, you can access it like this:
  const body = await request.text(); // or request.json() if you're expecting JSON data

  // Your Socket.IO server logic can be placed here
  return NextResponse.json({ message: 'Socket.IO server is running', receivedBody: body });
}

// If you need to handle GET or other HTTP methods, you can define them similarly:
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'GET request received' });
}
