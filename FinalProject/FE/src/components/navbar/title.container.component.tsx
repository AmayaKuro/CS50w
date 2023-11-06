"use client";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';

import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddIcon from '@mui/icons-material/Add';
import Button from "@mui/material/Button"
import CircularProgress from '@mui/material/CircularProgress';

import { type ConversationTitleProps, useConversation } from '@/assets/providers/conversation';
import { BEfetch } from '@/assets/fetch/BEfetch';

import styles from '@/css/navbar/title.module.css'


const TitleContainer: React.FC = () => {
    const { state: { conversationTitles, currentResponseProps }, dispatch: { setConversationTitles } } = useConversation();
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);

    const { data: session } = useSession();

    const router = useRouter();

    useEffect(() => {
        if (!session?.access_token || hasFetched) {
            return
        }

        BEfetch('/conversations', {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        }).then((res: ConversationTitleProps[]) => {
            setConversationTitles([...res]);
            setHasFetched(true);
            setLoading(false);
        });

    }, [session, hasFetched]);

    const handleTitleSelect = useCallback((conversation_id: string) => {
        if (currentResponseProps.conversation_id == conversation_id) {
            return {
                className: styles.selected,
                disabled: true,
            }
        }
    }, [currentResponseProps]);

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

                {conversationTitles.map((conversationTitle) => (
                    <Button
                        key={conversationTitle.conversation_id}
                        startIcon={<ChatBubbleOutlineIcon />}
                        onClick={() => router.push(`/chats/${conversationTitle.conversation_id}`)}
                        style={{ width: '100%' }}
                        {...handleTitleSelect(conversationTitle.conversation_id)}
                    >
                        <span style={{ textTransform: 'initial' }}>
                            {conversationTitle.title}
                        </span>
                    </Button>
                ))}
            </div>
        </>
    );
};

export default TitleContainer;
