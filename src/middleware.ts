import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    // Handle logout
    if (req.nextUrl.pathname === "/auth/logout") {
        const response = NextResponse.redirect(new URL("/auth/login", req.url));
        response.cookies.delete("token");
        return response;
    }

    const token = req.cookies.get("token")?.value;
    
    // If user is on auth pages and has token, redirect to dashboard
    if (
        req.nextUrl.pathname === "/auth/login" ||
        req.nextUrl.pathname === "/auth/signup" ||
        req.nextUrl.pathname === "/auth/verify"
    ) {
        if (token) {
            try {
                // Verify token by calling our API route
                const response = await fetch(new URL("/api/users/profile", req.url), {
                    headers: {
                        Cookie: `token=${token}`,
                    },
                });
                
                if (response.ok) {
                    return NextResponse.redirect(new URL("/app/dashboard", req.url));
                }
            } catch (error) {
                console.error("Middleware auth check error:", error);
            }
        }
        return NextResponse.next();
    }

    // Protect /app routes
    if (req.nextUrl.pathname.startsWith("/app")) {
        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }
        
        try {
            // Verify token by calling our API route
            const response = await fetch(new URL("/api/users/profile", req.url), {
                headers: {
                    Cookie: `token=${token}`,
                },
            });
            
            if (!response.ok) {
                return NextResponse.redirect(new URL("/auth/login", req.url));
            }
        } catch (error) {
            console.error("Middleware auth check error:", error);
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/auth/:path*", "/app/:path*"],
};
