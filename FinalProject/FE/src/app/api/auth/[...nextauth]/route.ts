import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"

import { BEfetch } from "@/assets/fetch";
import { refreshAccessToken, getCurrentEpochTime } from "@/assets/authenticate/token";
import * as env from "@/assets/env";


const handler = NextAuth({
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.username || !credentials?.password) throw new Error("Missing username or password")

                const payload = {
                    username: credentials?.username,
                    password: credentials?.password,
                }

                const res = await fetch(env.BACKEND_URL + "/login", {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })

                if (res.status === 401) throw new Error("Username or password is incorrect")

                const data = await res.json()

                // If no error and we have user data, return it
                if (res.ok && data) {
                    return data
                }

                // Catch-all error
                throw new Error("Something went wrong")

            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.name = user.user.name;
                token.access_token = user.access;
                token.refresh_token = user.refresh;
                // Access token has a lifetime of 29 minutes
                token.access_ref = getCurrentEpochTime() + env.BACKEND_ACCESS_TOKEN_LIFETIME;
                return token;
            }

            // Refresh the backend access token if it has expired
            if (getCurrentEpochTime() > token.access_ref) {
                const response = await refreshAccessToken(token["refresh_token"]);

                // else, update the token
                token["access_token"] = response.access;
                token["access_ref"] = getCurrentEpochTime() + env.BACKEND_ACCESS_TOKEN_LIFETIME;
            }

            return token;
        },

        async session({ token, session }) {
            session.access_token = token.access_token;
            session.expires = new Date(token.access_ref).toTimeString();
            session.user.name = token.name;
            return session;
        },

    },

    events: {
        // Sign out from server when user signs out from client 
        async signOut(messages) {
            const payload = {
                refresh: messages.token["refresh_token"],
            };

            await BEfetch("/signout", {
                method: "POST",
                body: JSON.stringify(payload),
            });
        },
    },

    pages: {
        signIn: "/login",
    },

    session: {
        strategy: 'jwt',
        maxAge: env.BACKEND_REFRESH_TOKEN_LIFETIME,
    },


    // Enable debug messages in the console if you are having problems
    debug: process.env.NODE_ENV === 'development',
})


export { handler as GET, handler as POST }