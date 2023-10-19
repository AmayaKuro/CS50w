"use client"
import { useSession } from "next-auth/react"

import { Button as SignOutButton } from "@/components/signOutButton.component"
import React, { useState } from "react"

export default function Chat() {
    const { data, update } = useSession()
    const [title, setTitle] = useState("scam")

    return (
        <div>
            <h1>Home</h1>
            <SignOutButton>Sign out</SignOutButton>
        </div>
    )
}
