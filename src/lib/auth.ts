import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
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
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }
      
      // Refresh subscription data on sign in or when triggered
      if (trigger === "signIn" || trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            subscriptionStatus: true,
            subscriptionPlan: true,
            trialEndsAt: true,
            hasUsedTrial: true,
          },
        });
        
        if (dbUser) {
          token.subscriptionStatus = dbUser.subscriptionStatus;
          token.subscriptionPlan = dbUser.subscriptionPlan;
          token.trialEndsAt = dbUser.trialEndsAt?.toISOString();
          token.hasUsedTrial = dbUser.hasUsedTrial;
        }
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
});

// Type augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      subscriptionStatus?: string | null;
      subscriptionPlan?: string | null;
      trialEndsAt?: string | null;
      hasUsedTrial?: boolean;
    };
  }
}
