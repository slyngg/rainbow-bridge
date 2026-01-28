import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

// Edge-compatible auth config (no Prisma/Node.js dependencies)
// This is used by middleware for session validation only
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    newUser: "/subscribe",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials provider placeholder for Edge - actual validation happens in auth.ts
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null, // Edge doesn't do actual auth, just session validation
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      
      const protectedRoutes = ["/dashboard", "/subscribe"];
      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );
      
      const authRoutes = ["/auth/signin", "/auth/signup"];
      const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
      
      // Redirect authenticated users away from auth pages
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      
      // Require auth for protected routes
      if (isProtectedRoute && !isLoggedIn) {
        return false; // Will redirect to signIn page
      }
      
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.subscriptionStatus = token.subscriptionStatus as string | null;
        session.user.subscriptionPlan = token.subscriptionPlan as string | null;
        session.user.trialEndsAt = token.trialEndsAt as string | null;
        session.user.hasUsedTrial = token.hasUsedTrial as boolean;
      }
      return session;
    },
  },
};
