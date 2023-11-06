"use client";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import InputBase from '@mui/material/InputBase';
import IconButton from "@mui/material/IconButton";
import SendIcon from '@mui/icons-material/Send';

import { type FetchResponseProps, useConversation } from "@/assets/providers/conversation";
import { BEfetch } from "@/assets/fetch/BEfetch";

import styles from "@/css/main/chatInput.module.css";


export default function ChatInput() {
    const { state: { currentResponseProps, creating }, dispatch: { setResponses, setCreating, setConversationTitles } } = useConversation();
    const [message, setMessage] = useState("");

    const { data: session } = useSession();
    const router = useRouter();


    const sendMessage = useCallback(() => {
        if (message === "" || !session?.access_token || creating) return;

        // Reset the message once the message is sent
        setMessage("");
        setCreating(true);

        if (currentResponseProps.conversation_id === "") {
            const payload = {
                message: message,
            };

            BEfetch(`/conversation`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(payload),
            }).then((res: FetchResponseProps) => {
                setConversationTitles((prev) => prev.concat({ title: res?.title ?? "", conversation_id: res.conversation_id }));
                setResponses([{
                    ...res,
                    message: message,
                }]);

                router.push(`/chats/${res.conversation_id}`);
                setCreating(false);
            }).catch((err) => {
                setCreating(false);
            });
        }
        else {
            const payload = {
                message: message,
                ...currentResponseProps,
            };

            BEfetch("/response", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(payload)
            }).then((res: FetchResponseProps) => {
                console.log(res);
                setResponses((prev) => prev.concat({
                    ...res,
                    message: message,
                }));
                setCreating(false);
            }).catch((err) => {
                setCreating(false);
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
                disabled={message === ""}
            />

        </div>

    )
}