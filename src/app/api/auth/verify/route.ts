import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward request to NestJS backend
    const response = await fetch(`${BACKEND_URL}/users/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Verify API error:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
