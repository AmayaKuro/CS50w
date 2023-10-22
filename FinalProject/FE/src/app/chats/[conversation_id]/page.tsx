"use client"
import { useSession } from "next-auth/react"
import { useState } from "react"

import { useConversastion } from "@/assets/providers/conversation"
import { Button as SignOutButton } from "@/components/signOutButton.component"

export default function Chat() {
    const { data: session } = useSession()
    const { state: { conversations } } = useConversastion()

    return (
        <div>
            <h1>Home</h1>
            <SignOutButton>Sign out</SignOutButton>
        </div>
    )
}
