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

    // If user is on auth pages and has token, redirect based on role
    if (
        req.nextUrl.pathname === "/auth/login" ||
        req.nextUrl.pathname === "/auth/signup" ||
        req.nextUrl.pathname === "/auth/verify"
    ) {
        if (token) {
            try {
                // Decode JWT to get role
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userRole = payload.role;

                // Redirect based on role
                if (userRole === 'SUPER_ADMIN' || userRole === 'EXPERT') {
                    return NextResponse.redirect(new URL("/admin", req.url));
                } else {
                    return NextResponse.redirect(new URL("/app/dashboard", req.url));
                }
            } catch (error) {
                console.error("Middleware token decode error:", error);
            }
        }
        return NextResponse.next();
    }

    // Protect /admin routes - Only SUPER_ADMIN and EXPERT
    if (req.nextUrl.pathname.startsWith("/admin")) {
        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }

        try {
            // Decode JWT to check role
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userRole = payload.role;

            // Check if user is admin or expert
            if (userRole !== 'SUPER_ADMIN' && userRole !== 'EXPERT') {
                return NextResponse.redirect(new URL("/app/dashboard", req.url));
            }
        } catch (error) {
            console.error("Middleware auth check error:", error);
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }
    }

    // Protect /app routes - Regular users only
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
    matcher: ["/auth/:path*", "/app/:path*", "/admin/:path*"],
};
