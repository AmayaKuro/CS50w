"use client"
import { useEffect, useCallback } from "react"
import { useParams } from "next/navigation"

import { type ConversationProps, useConversation, CreateResponseProps } from "@/assets/providers/conversation"
import Chat from "@/components/main/chat"


export default function Chats() {
    const { state: { conversations }, dispatch: { setCurrentResponseProps } } = useConversation();

    const param = useParams();
    const conversation_id = (param as { conversation_id: string }).conversation_id;

    useEffect(() => {
        // Match the current conversation_id to the conversation title
        const conversation = conversations.find((conversation) => conversation.conversation_id === conversation_id);
        if (conversation) {
            setCurrentResponseProps((prevState: CreateResponseProps) => {
                return ({ ...prevState, conversation_id: conversation.conversation_id } as CreateResponseProps)
            });
            document.title = `Chat: ${conversation.title}`;
        }
    }, [conversations]);

    return (
        <Chat
            key={conversation_id}
            conversation_id={conversation_id}
        />
    )
}
