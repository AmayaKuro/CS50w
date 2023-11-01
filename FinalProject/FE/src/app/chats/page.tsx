"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

import { useConversation } from "@/assets/providers/conversation"




export default function Home() {
    const { data, update } = useSession()

    const { dispatch: { setCurrentConversationIDCallback } } = useConversation();


    useEffect(() => {
        setCurrentConversationIDCallback("");
    }, []);

    return (
        <div>
            <h1>Home</h1>

        </div>
    )
}
