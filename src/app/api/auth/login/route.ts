import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward request to NestJS backend
    const response = await fetch(`${BACKEND_URL}/users/login`, {
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

    // Store token in cookie (optional, for better security)
    const responseWithCookie = NextResponse.json(data, { status: 200 });

    if (data.data?.token) {
      responseWithCookie.cookies.set("token", data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return responseWithCookie;
  } catch (error) {
    console.error("Login API error:", error);
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
