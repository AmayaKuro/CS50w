"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

import { useConversation } from "@/assets/providers/conversation"
import { CreateResponseLoading } from "@/components/main/CreateResponseLoading"




export default function Home() {
    const { data, update } = useSession()

    const { state: { createStatus }, dispatch: { setCurrentResponseProps } } = useConversation();


    useEffect(() => {
        setCurrentResponseProps({
            conversation_id: "",
            response_id: "",
            choice_id: "",
        });
    }, []);

    return (
        <div>
            <h1>Home</h1>
            {(createStatus.isCreating && createStatus.conversation_id === "") ? <CreateResponseLoading  message={createStatus.message}/> : null}
        </div>
    )
}
