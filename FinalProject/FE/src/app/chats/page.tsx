"use client"
import { useSession } from "next-auth/react"

import { Button } from "@/components/signOutButton.component"
import { useState, useEffect } from "react"


export default function Home() {
    const { data, update } = useSession()

    useEffect(() => {
        document.title = "Bard4Free";
    }, [])

    return (
        <div>
            <h1>Home</h1>
            <Button>Sign out</Button>
        </div>
    )
}
