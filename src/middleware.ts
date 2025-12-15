import axios from "@/lib/axios";
import { AxiosError } from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Response, User } from "./types/api.dt";

export async function middleware(req: NextRequest) {
    if (req.nextUrl.pathname === "/auth/logout") {
        const response = NextResponse.redirect(new URL("/auth/login", req.url));
        response.cookies.delete("token");
        return response;
    }

    const token = req.cookies.get("token")?.value;
    if (
        req.nextUrl.pathname === "/auth/login" ||
        req.nextUrl.pathname === "/auth/register" ||
        req.nextUrl.pathname === "/auth/verify"
    ) {
        if (token) {
            try {
                await axios.get<Response<User>>("/users/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                return NextResponse.redirect(
                    new URL("/app/dashboard", req.url)
                );
            } catch (error) {
                return NextResponse.next();
            }
        }
    }

    if (req.nextUrl.pathname.includes("/app")) {
        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }
        try {
            await axios.get<Response<User>>("/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log({ error: error.response?.data, token });
            }
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/auth/:path*", "/app/:path*"],
};
