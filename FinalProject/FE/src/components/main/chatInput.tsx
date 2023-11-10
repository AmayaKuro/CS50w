"use client";
import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import InputBase from '@mui/material/InputBase';
import IconButton from "@mui/material/IconButton";
import SendIcon from '@mui/icons-material/Send';

import { type FetchResponseProps, useConversation } from "@/assets/providers/conversation";
import { BackendFetch } from "@/assets/fetch/BE";

import styles from "@/css/main/chatInput.module.css";


export default function ChatInput() {
    const { state: { currentResponseProps, createStatus, initMessage }, dispatch: { setResponseDisplay, setCreateStatus, setConversationTitles } } = useConversation();
    const [message, setMessage] = useState("");

    const { data: session } = useSession();
    const router = useRouter();

    
    // If initMessage is not empty, send it as a new conversation
    useEffect(() => {
        if (initMessage !== "") {
            sendMessage(initMessage);
        }
    }, [initMessage]);


    const sendMessage = useCallback((initingMessage?: string) => {
        if ((message === "" && initMessage === "") || !session?.access_token) return;

        const sendMessage = initingMessage || message;

        // Set the creating status to true, the message to the current message
        // and reset the message once the message is sent
        setCreateStatus({
            isCreating: true,
            conversation_id: currentResponseProps.conversation_id,
            message: sendMessage,
        });

        setMessage("");

        if (currentResponseProps.conversation_id === "") {
            BackendFetch(`/conversation`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: {
                    message: sendMessage,
                },
            }).then((res) => {
                if (!res.ok) {
                    throw new Error(res.statusText);
                }

                return res.json();
            })
                .then((res: FetchResponseProps) => {
                    // Add the new conversation to the begin of conversation titles
                    setConversationTitles((prev) => [
                        {
                            conversation_id: res.conversation_id,
                            title: res.title ?? "",
                        },
                        ...prev,
                    ]);

                    // Set the current response props to the new conversation, mark as "create new conversation"
                    setResponseDisplay({
                        isCreateNewConversation: true,
                        responses: [{
                            ...res,
                            message: sendMessage,
                        }],
                    });

                    // Push to the new conversation before turn off isCreating
                    router.push(`/chats/${res.conversation_id}`);
                }).catch()
                .finally(() => {
                    setCreateStatus((prev) => ({
                        ...prev,
                        isCreating: false,
                    }));
                });
        }
        else {
            BackendFetch("/response", {
                method: "POST",
                headers: { Authorization: `Bearer ${session?.access_token}` },
                body: {
                    message: sendMessage,
                    ...currentResponseProps
                }
            }).then((res) => {
                if (!res.ok) {
                    throw new Error(res.statusText);
                }

                return res.json();
            })
                .then((res: FetchResponseProps) => {
                    setResponseDisplay((prev) => ({
                        isCreateNewConversation: false,
                        responses: prev.responses.concat({
                            ...res,
                            message: sendMessage,
                        }),
                    }));
                }).catch()
                .finally(() => {
                    setCreateStatus((prev) => ({
                        ...prev,
                        isCreating: false,
                    }));
                });
        }

    }, [message, session?.access_token, currentResponseProps]);


    return (
        <div className={styles.inputHolder}>
            <InputBase
                value={message}
                placeholder="Type a message"
                multiline
                maxRows={5}
                minRows={2}
                className={styles.textField}
                autoComplete="true"
                onChange={(e) => setMessage(e.currentTarget.value)}
            />
            <IconButton
                children={<SendIcon />}
                className={styles.submitButton}
                onClick={() => sendMessage()}
                disabled={message === "" || createStatus.isCreating}
            />

        </div>

    )
}