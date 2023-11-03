"use client";
import { useState, useCallback } from "react";

import InputBase from '@mui/material/InputBase';
import IconButton from "@mui/material/IconButton";
import SendIcon from '@mui/icons-material/Send';

import { useConversation } from "@/assets/providers/conversation";

import styles from "@/css/main/chatInput.module.css";


export default function ChatInput() {
    const [message, setMessage] = useState("");
    const { state: { currentResponseProps } } = useConversation();


    const sendMessage = useCallback(() => {
        setMessage("");
    }, [message]);
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
                onClick={sendMessage}
            />

        </div>

    )
}