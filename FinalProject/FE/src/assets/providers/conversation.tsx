"use client";
import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';


// This is used for the chat fetching
export type gettingResponseProps = {
    response_id: string;
    choice_id: string;
    message: string;
    log: string;
};

// This is used for passing context to the chatInput
export type ConversationProps = {
    title: string;
    conversation_id: string;
};

export type CreateResponseProps = {
    conversation_id: string;
    response_id: string;
    choice_id: string;
};

type ConversationContextType = {
    state: {
        conversations: ConversationProps[];
        currentResponseProps: CreateResponseProps;
    };
    dispatch: {
        setConversations: Dispatch<SetStateAction<ConversationProps[]>>;
        setCurrentResponseProps: Dispatch<SetStateAction<CreateResponseProps>>;
    };
};


export const ConversationContext = createContext({} as ConversationContextType);

export const useConversation = () => useContext(ConversationContext);

export const ConversationProvider = ({ children }: { children: React.ReactNode }) => {
    // Ex: [{title: "title", conversation_id: "conversation_id"}]
    const [conversations, setConversations] = useState<ConversationProps[]>([]);
    const [currentResponseProps, setCurrentResponseProps] = useState<CreateResponseProps>({ conversation_id: "", response_id: "", choice_id: "" });

    const value = {
        state: {
            conversations: conversations,
            currentResponseProps: currentResponseProps,
        },
        dispatch: { setConversations, setCurrentResponseProps }
    };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
}
