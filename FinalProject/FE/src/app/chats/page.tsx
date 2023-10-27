"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

import { useConversation } from "@/assets/providers/conversation"

import { Button } from "@/components/signOutButton.component"


export default function Home() {
    const { data, update } = useSession()

    const { dispatch: { setCurrentConversationCallback } } = useConversation();


    useEffect(() => {
        setCurrentConversationCallback("");
    }, []);

    return (
        <div>
            <h1>Home</h1>
            <Button>Sign out</Button>
        </div>
    )
}
