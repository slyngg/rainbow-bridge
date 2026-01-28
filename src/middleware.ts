import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/subscribe"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Auth routes (don't redirect if already on auth page)
  const authRoutes = ["/auth/signin", "/auth/signup"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If not authenticated and trying to access protected route
  if (!session && isProtectedRoute) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If authenticated and trying to access auth routes, redirect to dashboard
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If authenticated and accessing dashboard, check subscription
  if (session && pathname.startsWith("/dashboard")) {
    const user = session.user;
    
    // Check if user has active subscription or valid trial
    const hasActiveSubscription = user.subscriptionStatus === "active";
    const hasValidTrial = user.subscriptionStatus === "trialing" && 
      user.trialEndsAt && 
      new Date(user.trialEndsAt) > new Date();
    
    // If no subscription and no valid trial, redirect to subscribe page
    if (!hasActiveSubscription && !hasValidTrial) {
      return NextResponse.redirect(new URL("/subscribe", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/subscribe/:path*",
    "/auth/:path*",
  ],
};
