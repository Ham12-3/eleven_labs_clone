import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    // Use JWT token instead of full auth() to avoid Prisma in edge runtime
    const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
    });

    const path = request.nextUrl.pathname;

    const isAuthRoute = path === "/app/sign-in" || path === "/app/sign-up";
    const isProtectedRoute = path.startsWith("/app/") && !isAuthRoute;

    // If user has token and tries to access auth routes, redirect to app
    if (token && isAuthRoute) {
        return NextResponse.redirect(new URL("/app/speech-synthesis/text-to-speech", request.url));
    }

    // If user has no token and tries to access protected routes, redirect to sign-in
    if (!token && isProtectedRoute) {
        const signInUrl = new URL("/app/sign-in", request.url);
        signInUrl.searchParams.set("callbackUrl", request.url);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/app/:path*",
    ]
}