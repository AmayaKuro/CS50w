"use client";
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';

import { type ConversationProps, useConversastion } from '@/assets/providers/conversation';
import { fetchAPI } from '@/assets/fetch/base';


const TitleContainer: React.FC = () => {
    const { state: { conversations }, dispatch: { setConversations } } = useConversastion();
    const [hasFetched, setHasFetched] = useState(false);

    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.access_token || hasFetched) {
            return
        }

        fetchAPI('conversations', session?.access_token).then((res: ConversationProps[]) => {
            setConversations([["", ""], ...res]);
            setHasFetched(true);
        });

    }, [session, hasFetched]);

    return (
        <div>
            {conversations.map((conversation) => (
                <div key={conversation.conversation_id}>
                    <Link href={`chats/${conversation.conversation_id}`}>
                        {conversation.title}
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default TitleContainer;
