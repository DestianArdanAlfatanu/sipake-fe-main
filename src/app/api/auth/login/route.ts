import type { Response } from "@/types/api.dt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { username, password } = await req.json();

    // Send credentials to backend API
    const backendResponse = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (backendResponse.ok) {
        const {
            data: { token },
        }: Response<{ token: string }> = await backendResponse.json();

        return new Response("Login Succes", {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `token=${token}; HttpOnly; Path=/; SameSite=Lax; Secure; Max-Age=86400`,
            },
        });
    } else {
        const errorData = await backendResponse.json();
        console.log({errorData, status: backendResponse.status});
        return Response.json(errorData, { status: backendResponse.status });
    }
}
