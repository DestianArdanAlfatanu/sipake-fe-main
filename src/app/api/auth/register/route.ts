import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Forward FormData to NestJS backend
    const response = await fetch(`${BACKEND_URL}/users/register`, {
      method: "POST",
      body: formData, // FormData will automatically set correct Content-Type with boundary
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Register API error:", error);
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
