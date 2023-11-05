"use client";
import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';


// This is used for Creating chat 
export type CreatingResponseProps = {
    conversation_id: string;
    response_id: string;
    choice_id: string;
    title: string;
    log: string;
};

// This is used for the chat fetching
export type FetchingResponseProps = {
    response_id: string;
    choice_id: string;
    message?: string;
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
        responses: FetchingResponseProps[];
        creating: boolean;
    };
    dispatch: {
        setConversations: Dispatch<SetStateAction<ConversationProps[]>>;
        setCurrentResponseProps: Dispatch<SetStateAction<CreateResponseProps>>;
        setResponses: Dispatch<SetStateAction<FetchingResponseProps[]>>;
        setCreating: Dispatch<SetStateAction<boolean>>;
    };
};


export const ConversationContext = createContext({} as ConversationContextType);

export const useConversation = () => useContext(ConversationContext);

export const ConversationProvider = ({ children }: { children: React.ReactNode }) => {
    // Ex: [{title: "title", conversation_id: "conversation_id"}]
    const [conversations, setConversations] = useState<ConversationProps[]>([]);
    const [currentResponseProps, setCurrentResponseProps] = useState<CreateResponseProps>({ conversation_id: "", response_id: "", choice_id: "" });
    const [responses, setResponses] = useState<FetchingResponseProps[]>([]);
    // This indicate if the new response is loading
    const [creating, setCreating] = useState<boolean>(false);

    const value = {
        state: {
            conversations: conversations,
            currentResponseProps: currentResponseProps,
            responses: responses,
            creating: creating
        },
        dispatch: { setConversations, setCurrentResponseProps, setResponses, setCreating }
    };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
}
