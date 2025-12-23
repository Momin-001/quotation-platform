import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Use jose for Edge compatibility if needed, or just standard check
import { JWT_SECRET } from "@/lib/constants";

// We need a text encoder for jose
const secret = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    // Paths that require authentication
    const protectedPaths = ["/admin", "/profile", "/api/auth/me"]; // Add more as needed
    // Paths reserved for admin
    const adminPaths = ["/admin"];

    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

    if (isProtected) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            // Verify token
            const { payload } = await jwtVerify(token, secret);

            const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
            if (isAdminPath && payload.role !== "admin") {
                return NextResponse.redirect(new URL("/", request.url));
            }

        } catch (err) {
            // Token invalid
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/profile/:path*", "/api/auth/me"],
};
