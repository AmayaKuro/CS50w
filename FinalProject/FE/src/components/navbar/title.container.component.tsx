"use client";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';

import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddIcon from '@mui/icons-material/Add';
import Button from "@mui/material/Button"
import CircularProgress from '@mui/material/CircularProgress';

import { type ConversationProps, useConversation } from '@/assets/providers/conversation';
import { fetchAPI } from '@/assets/fetch/base';

import styles from '@/css/navbar/title.module.css'


const TitleContainer: React.FC = () => {
    const { state: { conversations }, dispatch: { setConversations } } = useConversation();
    const [loading, setLoading] = useState(true);
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
            setLoading(false);
        });

    }, [session, hasFetched]);

    return (
        <>
            <div className={styles.newConvContainer}>
                <Button
                    className={styles.newConvBtn}
                    size="large"
                    startIcon={<AddIcon />}
                    color='secondary'
                    onClick={() => router.push("/chats")}>New Chat</Button>
            </div>

            <div className={styles.titleContainer}>
                {loading &&
                    <div className={styles.loadingContainer}>
                        <CircularProgress />
                    </div>
                }

                {conversations.map((conversation) => (
                    <Button
                        key={conversation.conversation_id}
                        startIcon={<ChatBubbleOutlineIcon />}
                        onClick={() => router.push(`/chats/${conversation.conversation_id}`)}
                        style={{ width: '100%' }}
                    >
                        <span style={{ textTransform: 'initial' }}>
                            {conversation.title}
                        </span>
                    </Button>
                ))}
            </div>
        </>
    );
};

export default TitleContainer;
