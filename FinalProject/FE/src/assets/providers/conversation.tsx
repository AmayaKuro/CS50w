"use client";
import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';


export type ConversationProps = {
    title: string;
    conversation_id: string;
};

type ConversationContextType = {
    state: Record<string, ConversationProps[]>;
    dispatch: Record<string, Dispatch<SetStateAction<any>>>;
};


export const ConversationContext = createContext({} as ConversationContextType);

export const useConversastion = () => useContext(ConversationContext);

export const ConversationProvider = ({ children }: { children: React.ReactNode }) => {
    // Ex: [{title: "title", conversation_id: "conversation_id"}]
    const [conversations, setConversations] = useState<ConversationProps[]>([{ title: "", conversation_id: "" }]);

    const value = { state: { conversations }, dispatch: { setConversations } };
    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
}
