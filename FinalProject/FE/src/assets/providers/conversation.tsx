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
        current_conversation: ConversationProps;
    };
    dispatch: Record<string, Dispatch<SetStateAction<any>>> | Record<string, Function>;
};


export const ConversationContext = createContext({} as ConversationContextType);

export const useConversation = () => useContext(ConversationContext);

export const ConversationProvider = ({ children }: { children: React.ReactNode }) => {
    // Ex: [{title: "title", conversation_id: "conversation_id"}]
    const [conversations, setConversations] = useState<ConversationProps[]>([]);
    const [current_conversation, setCurrentConversation] = useState<ConversationProps>({ title: "", conversation_id: "" });

    // TODO: Pass this to the chats page
    const setCurrentConversationCallback = useCallback((conversation_id: string) => {
        // If conversation_id is empty, it's homepage
        // else, it's a conversation page
        if (conversation_id) {
            const conversation = conversations.find((conversation) => conversation.conversation_id === conversation_id);
            if (conversation) {
                setCurrentConversation(conversation);
                document.title = `Chat: ${conversation.title}`;
            }
        }
        else {
            setCurrentConversation({ title: "", conversation_id: "" });
            document.title = `Bard4Free`;
        }
    }, [conversations, setCurrentConversation]);

    const value = {
        state: {
            conversations: conversations,
            current_conversation: current_conversation,
        },
        dispatch: { setConversations, setCurrentConversationCallback }
    };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
}
