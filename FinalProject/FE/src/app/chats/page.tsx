"use client"
import { useSession } from "next-auth/react"

import { Button } from "@/components/signOutButton.component"
import { useState } from "react"


export default function Home() {
    const {data, update} = useSession()
    data?.access_token
    return (
        <div>
            <h1>Home</h1>
            <Button>Sign out</Button>
        </div>
    )
}
