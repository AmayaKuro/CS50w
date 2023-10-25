import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { fetchAPI } from "@/assets/fetch/base";

type Response = {
    response_id: string;
    choice_id: string;
    message: string;
    log: string;
};



const Chat: React.FC<{ conversation_id: string }> = ({ conversation_id }) => {
    const [responses, setResponses] = useState<Response[]>([]);
    const [hasFetched, setHasFetched] = useState(false);

    const { data: session } = useSession();


    // Allow fetching of responses when conversation_id changes
    useEffect(() => {
        setHasFetched(false);
    }, [conversation_id]);

    useEffect(() => {
        if (session && !hasFetched) {
            fetchAPI(`response?conversation_id=${conversation_id}`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                },
            }).then((res: Response[]) => setResponses(res))
        }
    }, [session, hasFetched]);

    return (
        <div>
            {responses.map((response) => (
                <div key={response.response_id}>
                    <div dangerouslySetInnerHTML={{ __html: response.log }} />
                </div>
            ))}
        </div>
    );
};

export default Chat;
