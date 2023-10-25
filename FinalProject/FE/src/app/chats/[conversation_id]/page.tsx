"use client"
import { useEffect } from "react"

import { type ConversationProps, useConversastion } from "@/assets/providers/conversation"
import Chat from "@/components/main/chat"


export default function Chats({ params: { conversation_id } }: { params: { conversation_id: string } }) {
    const { state: { conversations } } = useConversastion()

    useEffect(() => {
        const title = conversations.find((conversation) => conversation.conversation_id === conversation_id)?.title

        if (title) document.title = `Chat: ${title}`
        else {
            return () => {
                // throw new Error('404 Not Found')
            }
        }
    }), [conversations, conversation_id]

    return (
        <div>
            <Chat conversation_id={conversation_id} />

        </div>
    )
}
