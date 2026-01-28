import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use the Edge-compatible auth config (no Prisma dependencies)
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/subscribe/:path*",
    "/auth/:path*",
  ],
};
