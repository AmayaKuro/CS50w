import Markdown from 'markdown-to-jsx';
import { renderToString } from 'react-dom/server';

import { type ResponseProps } from "@/assets/providers/conversation";
import Wrapper from './response/Wrapper';
import UserMessage from './response/UserMessage';

import styles from "@/css/main/chat.module.css";

import hljs from "highlight.js/lib/common";


const HighLightSyntax: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const highlightedCode = hljs.highlightAuto(renderToString(children) || "").value;

    return (
        <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    );
}


const Chat: React.FC<{ responses: ResponseProps[] }> = ({ responses }) => {
    return (
        <>
            {responses.map((response) => (
                <div key={response.response_id} className={styles.container}>
                    <UserMessage message={response.message} />

                    <Wrapper>
                        <HighLightSyntax>
                            <Markdown>
                                {response.log}
                            </Markdown>
                        </HighLightSyntax>
                    </Wrapper>
                </div>
            ))}
        </>
    );
};

export default Chat;
