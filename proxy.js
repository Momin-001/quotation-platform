import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "@/lib/constants";
import { routing } from "./i18n/routing";

const secret = new TextEncoder().encode(JWT_SECRET);
const intlMiddleware = createMiddleware({ ...routing, localeDetection: false });

const AUTH_PAGES = ["/login", "/register", "/reset-password", "/forgot-password"];

function getLocaleFromPathname(pathname) {
    if (pathname === "/en" || pathname.startsWith("/en/")) {
        return "en";
    }
    return "de";
}

function stripLocalePrefix(pathname) {
    if (pathname === "/en") return "/";
    if (pathname.startsWith("/en/")) {
        const rest = pathname.slice(3);
        return rest ? `/${rest}` : "/";
    }
    return pathname;
}

function localizedPath(path, locale) {
    if (locale === "en") {
        return path === "/" ? "/en" : `/en${path}`;
    }
    return path;
}

async function verifyAdminAccess(request, pathname) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== "admin" && payload.role !== "super_admin") {
            return NextResponse.redirect(new URL("/", request.url));
        }

        if (pathname.startsWith("/admin/cms") && payload.role !== "super_admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }

        return null;
    } catch {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    if (pathname === "/de" || pathname.startsWith("/de/")) {
        const path = pathname.replace(/^\/de/, "") || "/";
        return NextResponse.redirect(new URL(path, request.url));
    }

    if (pathname.startsWith("/admin")) {
        const denied = await verifyAdminAccess(request, pathname);
        return denied ?? NextResponse.next();
    }

    if (pathname === "/api/auth/me") {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        try {
            await jwtVerify(token, secret);
        } catch {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
        return NextResponse.next();
    }

    const logicalPath = stripLocalePrefix(pathname);
    const locale = getLocaleFromPathname(pathname);
    const token = request.cookies.get("token")?.value;

    const isAuthPage = AUTH_PAGES.some(
        (path) => logicalPath === path || logicalPath.startsWith(`${path}/`),
    );
    const isUserPath = logicalPath.startsWith("/user");

    if (isAuthPage && token) {
        try {
            const { payload } = await jwtVerify(token, secret);

            if (payload.role === "admin" || payload.role === "super_admin") {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            return NextResponse.redirect(new URL(localizedPath("/", locale), request.url));
        } catch {
            // Invalid token — allow auth pages
        }
    }

    if (isUserPath) {
        if (!token) {
            return NextResponse.redirect(
                new URL(localizedPath("/login", locale), request.url),
            );
        }

        try {
            const { payload } = await jwtVerify(token, secret);

            if (payload.role !== "user") {
                return NextResponse.redirect(new URL(localizedPath("/", locale), request.url));
            }
        } catch {
            return NextResponse.redirect(
                new URL(localizedPath("/login", locale), request.url),
            );
        }
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
