import { BEfetch } from "../fetch";
import { NEXTAUTH_URL } from "../env"

export const refreshAccessToken = async (refreshToken: string) => {
    var response;
    const payload = {
        refresh: refreshToken,
    };
    try {
        response = await BEfetch("/token/refresh/", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }
    // If cannnot get a new access token, sign out
    catch (e) {
        await fetch(NEXTAUTH_URL + "/auth/signout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        throw new Error("Cannot authenticate");
    }

    return response;
};


export const getCurrentEpochTime = () => {
    return Math.floor(Date.now() / 1000);
};