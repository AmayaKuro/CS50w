"use client";
import { Dispatch, SetStateAction, createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';


export type ConversationProps = {
    title: string;
    conversation_id: string;
};

type ConversationContextType = {
    state: {
        conversations: ConversationProps[];
        currentConversationID: string;
    };
    dispatch: Record<string, Dispatch<SetStateAction<any>>> | Record<string, Function>;
};


export const ConversationContext = createContext({} as ConversationContextType);

export const useConversation = () => useContext(ConversationContext);

export const ConversationProvider = ({ children }: { children: React.ReactNode }) => {
    // Ex: [{title: "title", conversation_id: "conversation_id"}]
    const [conversations, setConversations] = useState<ConversationProps[]>([]);
    const [currentConversationID, setCurrentConversationID] = useState<string>("");

    // TODO: Pass this to the chats page
    const setCurrentConversationIDCallback = useCallback((conversation_id: string) => {
        // If conversation_id is empty, it's homepage
        // else, it's a conversation page
        if (conversation_id) {
            const conversation = conversations.find((conversation) => conversation.conversation_id === conversation_id);
            if (conversation) {
                setCurrentConversationID(conversation.conversation_id);
                document.title = `Chat: ${conversation.title}`;
            }
        }
        else {
            setCurrentConversationID("");
            document.title = `Bard4Free`;
        }
    }, [conversations, setCurrentConversationID]);

    const value = {
        state: {
            conversations: conversations,
            currentConversationID: currentConversationID,
        },
        dispatch: { setConversations, setCurrentConversationIDCallback }
    };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
}
