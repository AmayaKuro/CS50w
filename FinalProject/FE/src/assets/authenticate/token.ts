import { BEfetch } from "../fetch/BEfetch";
import { NEXTAUTH_URL } from "../env"

export const refreshAccessToken = async (refreshToken?: string) => {
    // If no refresh token, throw error
    if (!refreshToken) {
        new Error("No refresh token");
    }

    const payload = {
        refresh: refreshToken,
    };
    
    try {
        const response = await BEfetch("/token/refresh/", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        return response;
    }
    // If cannnot get a new access token, sign out
    catch (e) {
        await fetch(NEXTAUTH_URL + "/api/auth/signout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        // Throw error can lead to error in app
        // throw new Error("Cannot authenticate");
    }
};


export const getCurrentEpochTime = () => {
    return Math.floor(Date.now() / 1000);
};