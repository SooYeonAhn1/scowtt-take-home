import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "../../../../lib/prisma";
import { session } from "../../../../lib/session";

export const authOptions: NextAuthOptions = { 
    session: {
        strategy: 'jwt',
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!profile?.email) {
                throw new Error('No Profile')
            }
            const userImage = profile.image || `https://ui-avatars.com/api/?name=${profile.name}&background=random`;
            await prisma.user.upsert({
                where: {
                    email: profile.email,
                },
                create: {
                    email: profile.email,
                    name: profile.name,
                    image: userImage,
                },
                update: {
                    name: profile.name,
                    image: userImage,
                },
            })
            return true
        },
        session,
        async jwt({  token, user, account, profile }) {
            if (profile) {
                const user = await prisma.user.findUnique({
                    where: {
                        email: profile.email,
                    },
                })
                if (!user) {
                    throw new Error('No User Found')
                }
                token.id = user.id
            }
            return token
        },
    },
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };