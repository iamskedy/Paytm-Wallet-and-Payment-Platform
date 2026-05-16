import GoogleProvider from "next-auth/providers/google";
import db from "@repo/db/client";
import type { Account } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        })
    ],
    callbacks: {
        async signIn({ user, account }: {
            user: AdapterUser;
            account: Account | null;
        }) {
            if (!user || !user.email) {
                return false;
            }

            await db.merchant.upsert({
                select: { id: true },
                where: { email: user.email },
                create: {
                    email: user.email,
                    name: user.name ?? "",
                    auth_type: account?.provider === "google" ? "Google" : "Github"
                },
                update: {
                    name: user.name ?? "",
                    auth_type: account?.provider === "google" ? "Google" : "Github"
                }
            });

            return true;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "secret"
};