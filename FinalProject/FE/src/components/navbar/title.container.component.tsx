"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import Button from "@mui/material/Button"

import { type ConversationProps, useConversastion } from '@/assets/providers/conversation';
import { fetchAPI } from '@/assets/fetch/base';
import { PlusIcon } from "@/assets/mui/icon";

import styles from '@/css/navbar/title.module.css'


const TitleContainer: React.FC = () => {
    const { state: { conversations }, dispatch: { setConversations } } = useConversastion();
    const [hasFetched, setHasFetched] = useState(false);

    const { data: session } = useSession();

    const router = useRouter();

    useEffect(() => {
        if (!session?.access_token || hasFetched) {
            return
        }

        fetchAPI('conversations', {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        }).then((res: ConversationProps[]) => {
            setConversations([...res]);
            setHasFetched(true);
        });

    }, [session, hasFetched]);

    return (
        <div className={styles.titleContainer}>
            <div className={styles.newConvContainer}>
                <Button 
                className={styles.newConvBtn} 
                size="large" startIcon={<PlusIcon />} 
                onClick={() => router.push("/chats")}>New Chat</Button>
            </div>

            {conversations.map((conversation) => (
                <div key={conversation.conversation_id}>
                    <Link href={`/chats/${conversation.conversation_id}`}>
                        {conversation.title}
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default TitleContainer;
