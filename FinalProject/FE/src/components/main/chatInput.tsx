"use client";
import { useState, useCallback } from "react";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import { useConversation } from "@/assets/providers/conversation";


export default function ChatInput() {
    const [message, setMessage] = useState("");
    const { state: { currentConversationID } } = useConversation();


    const sendMessage = useCallback(() => {
        setMessage("");
    }, [message]);
    return (
        <>
            <TextField
                value={message}
                onChange={(e) => setMessage(e.currentTarget.value)}
                onKeyPress={(e) => {
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                }}
            />
            <Button onClick={sendMessage}>Send</Button>
        </>

    )
}