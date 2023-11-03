import Markdown from 'markdown-to-jsx';

import AccountCircle from "@mui/icons-material/AccountCircle";

import { gettingResponseProps } from "@/assets/providers/conversation";

import styles from "@/css/main/chat.module.css";


const Chat: React.FC<{ responses: gettingResponseProps[] }> = ({ responses }) => {

    return (
        <>
            {responses.map((response) => (
                <div key={response.response_id}>
                    <div className={styles.userMessage}>
                        <AccountCircle />
                        {response.message}
                    </div>
                    <div className={styles.markdownContainer}>
                        <Markdown children={response.log} />
                    </div>

                </div>
            ))}
        </>
    );
};

export default Chat;
