"use client"
import { useEffect, useCallback, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"

import { type FetchResponseProps, useConversation, } from "@/assets/providers/conversation"
import { BackendFetch } from "@/assets/fetch/BE"
import Chat from "@/components/main/chat"


export default function Chats() {
    const { state: { conversationTitles, responseDisplay, createStatus }, dispatch: { setCurrentResponseProps, setResponseDisplay } } = useConversation();
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const { data: session } = useSession();

    const param = useParams();
    const conversation_id = (param as { conversation_id: string }).conversation_id;

    // This will always set current response props to the last response when responses state changes
    useEffect(() => {
        const { responses } = responseDisplay;

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
    }, [conversationTitles, responseDisplay]);

    useEffect(() => {
        if (hasFetched) return;

        if (responseDisplay.isCreateNewConversation) {
            setHasFetched(true);
            return;
        }

        if (session?.access_token && !loading) {
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
                    setResponseDisplay({
                        isCreateNewConversation: false,
                        responses: res,
                    });
                    setLoading(false);
                    setHasFetched(true);
                })
                .catch((err) => {
                    setLoading(false);
                });
        }
    }, [session?.access_token, hasFetched, loading, responseDisplay.isCreateNewConversation]);


    return (
        <>
            <Chat
                responses={responseDisplay.responses}
            />
            {(loading) ? <div>Loading...</div> : null}
        </>

    )
}
