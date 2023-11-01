import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Markdown from 'markdown-to-jsx';

import AccountCircle from "@mui/icons-material/AccountCircle";

import { BEfetch } from "@/assets/fetch";

import styles from "@/css/main/chat.module.css";


type Response = {
    response_id: string;
    choice_id: string;
    message: string;
    log: string;
};


const Chat: React.FC<{ conversation_id: string }> = ({ conversation_id }) => {
    const [responses, setResponses] = useState<Response[]>([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: session } = useSession();


    useEffect(() => {
        if (loading) return;
        
        if (session?.access_token && !hasFetched) {
            setLoading(true);
            BEfetch(`/response?conversation_id=${conversation_id}`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                },
            }).then((res: Response[]) => {
                setResponses(res);
                setHasFetched(true);
                setLoading(false);
            })
        }
    }, [session?.access_token, hasFetched, loading]);

    return (
        <>
            {responses.map((response) => (
                <div key={response.response_id}>
                    <div className={styles.userMessage}>
                        <AccountCircle />
                        {response.message}
                    </div>
                    <div className={styles.markdownContainer}>
                        <Markdown children={response.log} />
                    </div>

                </div>
            ))}
        </>
    );
};

export default Chat;
