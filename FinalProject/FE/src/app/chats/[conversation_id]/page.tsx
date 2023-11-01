"use client"
import { useEffect } from "react"

import { type ConversationProps, useConversation } from "@/assets/providers/conversation"
import Chat from "@/components/main/chat"


export default function Chats({ params: { conversation_id } }: { params: { conversation_id: string } }) {
    const { state: { conversations }, dispatch: { setCurrentConversationIDCallback } } = useConversation();

    useEffect(() => {
        setCurrentConversationIDCallback(conversation_id);
    }, [conversation_id]);

    return (
        <Chat
            key={conversation_id}
            conversation_id={conversation_id}
        />
    )
}
