import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "@repo/db/client";
import bcrypt from "bcrypt";
import type { Account, User } from "next-auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        const user = await db.user.findFirst({
          where: { number: credentials.phone },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email ?? user.number,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      if (account?.provider === "google") {
        if (!user?.email) return false;

        await db.user.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            name: user.name ?? "",
            password: "",
            auth_type: "Google",
          },
          update: {
            name: user.name ?? "",
          },
        });
      }
      return true;
    },

    async jwt({ token, user }: any) {
      if (user) {
        const dbUser = await db.user.findFirst({
          where: {
            OR: [
              { email: token.email ?? "" },
              { number: token.email ?? "" },
            ],
          },
          select: { id: true, number: true },
        });
        if (dbUser) {
          token.id = String(dbUser.id);
          token.number = dbUser.number;
        }
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.number = token.number;
      }
      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Don't interrupt onboarding flow
      if (url.includes("/onboarding")) return url;
      // After any sign in, check onboarding status
      if (url.startsWith(baseUrl)) return `${baseUrl}/onboarding/check`;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/",
  },

  secret: process.env.NEXTAUTH_SECRET || "secret",
};