import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"

const getCurrentEpochTime = () => {
    return Math.floor(new Date().getTime() / 1000);
};

const SIGN_IN_HANDLERS = {
    "credentials": async (user, account, profile, email, credentials) => {
        return true;
    },
};
const SIGN_IN_PROVIDERS = Object.keys(SIGN_IN_HANDLERS);


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

                const res = await fetch(process.env.NEXTAUTH_BACKEND_URL + "/login", {
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
        async jwt({ token, user, account }) {
            if (account && user) {
                let backendResponse = account.provider === "credentials" ? user : account.meta;
                token["name"] = backendResponse.user.name;
                token["access_token"] = backendResponse.access;
                token["refresh_token"] = backendResponse.refresh;
                token["ref"] = getCurrentEpochTime() + process.env.BACKEND_ACCESS_TOKEN_LIFETIME;
                return token;
            }

            // Refresh the backend access token if it has expired
            if (getCurrentEpochTime() > token["ref"]) {
                const payload = {
                    refresh: token["refresh_token"],
                };

                const response = await fetch(process.env.NEXTAUTH_BACKEND_URL + "/token/refresh/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();

                // If cannnot get a new access token, sign out
                if (!response.ok) {
                    await fetch(process.env.NEXTAUTH_URL + "/api/auth/signout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                    });

                    throw new Error(data?.detail ?? "Cannot authenticate");
                }

                // else, update the token
                token["access_token"] = data.access;
                token["ref"] = getCurrentEpochTime() + process.env.BACKEND_ACCESS_TOKEN_LIFETIME;
            }

            return token;
        },

        async session({ token }) {
            return token;
        },

    },

    events: {
        // Sign out from server when user signs out from client 
        async signOut(messages) {
            const payload = {
                refresh: messages.token["refresh_token"],
            };

            await fetch(process.env.NEXTAUTH_BACKEND_URL + "/signout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        },
    },

    pages: {
        signIn: "/login",
    },

    secret: process.env.SECRET,
    session: {
        strategy: 'jwt',
        maxAge: parseInt(process.env.BACKEND_REFRESH_TOKEN_LIFETIME),
    },


    // Enable debug messages in the console if you are having problems
    debug: process.env.NODE_ENV === 'development',
})


export { handler as GET, handler as POST }