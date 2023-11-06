"use client";
import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';


// Base response props
export type ResponseProps = {
    response_id: string;
    choice_id: string;
    message: string;
    log: string;
};

// This is used for the chat fetching
// title is not provided when continuing a conversation
export type FetchResponseProps = {
    conversation_id: string;
    title?: string;
} & ResponseProps;

// This is used for title display
export type ConversationTitleProps = {
    title: string;
    conversation_id: string;
};

// This is used for passing context to the chatInput
export type CreateResponseProps = {
    conversation_id: string;
    response_id: string;
    choice_id: string;
};

type ConversationContextType = {
    state: {
        conversationTitles: ConversationTitleProps[];
        currentResponseProps: CreateResponseProps;
        responses: ResponseProps[];
        creating: boolean;
    };
    dispatch: {
        setConversationTitles: Dispatch<SetStateAction<ConversationTitleProps[]>>;
        setCurrentResponseProps: Dispatch<SetStateAction<CreateResponseProps>>;
        setResponses: Dispatch<SetStateAction<ResponseProps[]>>;
        setCreating: Dispatch<SetStateAction<boolean>>;
    };
};


export const ConversationContext = createContext({} as ConversationContextType);

export const useConversation = () => useContext(ConversationContext);

export const ConversationProvider = ({ children }: { children: React.ReactNode }) => {
    // Ex: [{title: "title", conversation_id: "conversation_id"}]
    const [conversationTitles, setConversationTitles] = useState<ConversationTitleProps[]>([]);
    const [currentResponseProps, setCurrentResponseProps] = useState<CreateResponseProps>({ conversation_id: "", response_id: "", choice_id: "" });
    const [responses, setResponses] = useState<ResponseProps[]>([]);
    // This indicate if the new response is loading
    const [creating, setCreating] = useState<boolean>(false);

    const value = {
        state: {
            conversationTitles: conversationTitles,
            currentResponseProps: currentResponseProps,
            responses: responses,
            creating: creating
        },
        dispatch: { setConversationTitles, setCurrentResponseProps, setResponses, setCreating }
    };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
}
