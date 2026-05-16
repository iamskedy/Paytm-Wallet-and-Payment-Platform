import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: {
          label: "Phone number",
          type: "text",
          placeholder: "1231231231",
          required: true,
        },
        password: {
          label: "Password",
          type: "password",
          required: true,
        },
      },

      async authorize(credentials: any) {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }

        const existingUser = await db.user.findFirst({
          where: {
            number: credentials.phone,
          },
        });

        // LOGIN FLOW
        if (existingUser) {
          const valid = await bcrypt.compare(
            credentials.password,
            existingUser.password
          );

          if (!valid) {
            return null;
          }

          return {
            id: existingUser.id.toString(),
            name: existingUser.name,
            email: existingUser.number,
          };
        }

        // SIGNUP FLOW
        const hashedPassword = await bcrypt.hash(
          credentials.password,
          10
        );

        try {
          const user = await db.user.create({
            data: {
              number: credentials.phone,
              password: hashedPassword,

              // Create balance during signup
              balance: {
                create: {
                  amount: 0,
                  locked: 0,
                },
              },
            },
          });

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.number,
          };
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    }),
  ],

  secret: process.env.JWT_SECRET || "secret",

  callbacks: {
    async session({
      token,
      session,
    }: {
      token: JWT;
      session: Session;
    }) {
      if (token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
};