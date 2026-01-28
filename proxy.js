import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "@/lib/constants";

const secret = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    const protectedPaths = ["/admin", "/api/auth/me", "/user"];
    const adminPaths = ["/admin"];
    const userPaths = ["/user"];

    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
    const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
    const isUserPath = userPaths.some((path) => pathname.startsWith(path));

    if (isProtected) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            const { payload } = await jwtVerify(token, secret);
            if (isAdminPath && payload.role !== "admin" && payload.role !== "super_admin") {
                return NextResponse.redirect(new URL("/", request.url));
            }
            if (isUserPath && payload.role !== "user") {
                return NextResponse.redirect(new URL("/", request.url));
            }
        } catch (err) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/auth/me", "/user/:path*"],
};
