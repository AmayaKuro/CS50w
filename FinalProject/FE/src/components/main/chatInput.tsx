"use client";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import InputBase from '@mui/material/InputBase';
import IconButton from "@mui/material/IconButton";
import SendIcon from '@mui/icons-material/Send';

import { type FetchResponseProps, useConversation } from "@/assets/providers/conversation";
import { BackendFetch } from "@/assets/fetch/BE";

import styles from "@/css/main/chatInput.module.css";


export default function ChatInput() {
    const { state: { currentResponseProps, createStatus }, dispatch: { setResponseDisplay, setCreateStatus, setConversationTitles } } = useConversation();
    const [message, setMessage] = useState("");

    const { data: session } = useSession();
    const router = useRouter();


    const sendMessage = useCallback(() => {
        if (message === "" || !session?.access_token) return;

        // Set the creating status to true, the message to the current message
        // and reset the message once the message is sent
        setCreateStatus({
            isCreating: true,
            message: message,
        });
        setMessage("");

        if (currentResponseProps.conversation_id === "") {
            BackendFetch(`/conversation`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: {
                    message: message,
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
                            message: message,
                        }],
                    });

                    setCreateStatus({
                        isCreating: false,
                        // This is the message that is sent
                        message: message,
                    });

                    router.push(`/chats/${res.conversation_id}`);

                }).catch((err) => {
                    setCreateStatus({
                        isCreating: false,
                        message: "",
                    });
                });
        }
        else {
            BackendFetch("/response", {
                method: "POST",
                headers: { Authorization: `Bearer ${session?.access_token}` },
                body: {
                    message: message,
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
                        isCreateNewConversation: true,
                        responses: prev.responses.concat({
                            ...res,
                            message: message,
                        }),
                    }));

                    setCreateStatus({
                        isCreating: false,
                        // This is the message that is sent
                        message: message,
                    });
                }).catch((err) => {
                    setCreateStatus({
                        isCreating: false,
                        message: "",
                    });
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