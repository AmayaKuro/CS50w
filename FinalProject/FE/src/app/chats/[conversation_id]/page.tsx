"use client"
import { useEffect, useCallback, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"

import { type FetchResponseProps, useConversation, } from "@/assets/providers/conversation"
import { BackendFetch } from "@/assets/fetch/BE"
import Chat from "@/components/main/chat"


export default function Chats() {
    const { state: { conversationTitles, responses, creating }, dispatch: { setCurrentResponseProps, setResponses } } = useConversation();
    const [hasFetched, setHasFetched] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: session } = useSession();

    const param = useParams();
    const conversation_id = (param as { conversation_id: string }).conversation_id;

    // This will always set current response props to the last response when responses state changes
    useEffect(() => {
        // Match the current conversation_id to the conversation title
        const conversation = conversationTitles.find((conversationTitle) => conversationTitle.conversation_id === conversation_id);
        if (conversation && responses.length > 0) {
            // Set the current response props to the last response
            setCurrentResponseProps({
                conversation_id: conversation.conversation_id,
                response_id: responses[responses.length - 1].response_id,
                choice_id: responses[responses.length - 1].choice_id,
            });
            document.title = `Chat: ${conversation.title}`;
        }
    }, [conversationTitles, responses]);

    useEffect(() => {
        if (loading) return;

        if (session?.access_token && !hasFetched) {
            setLoading(true);
            BackendFetch(`/response?conversation_id=${conversation_id}`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                },
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(res.statusText);
                    }

                    return res.json();
                })
                .then((res: FetchResponseProps[]) => {
                    setResponses(res);
                    setHasFetched(true);
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                });
        }
    }, [session?.access_token, hasFetched, loading]);


    return (
        <>
            <Chat
                responses={responses}
            />
            {(loading) ? <div>Loading...</div> : null}
        </>

    )
}
