import LinearProgress from '@mui/material/LinearProgress';

import UserMessage from './response/UserMessage';
import Wrapper from './response/Wrapper';

export const CreateResponseLoading: React.FC<{ message?: string }> = ({ message }) => {

    return (
        <div >
            <UserMessage message={message} />
            <Wrapper style={{
                height: "80%",
                width: "100%",
            }}>
                <LinearProgress color="primary" />
            </Wrapper>
        </div>

    );
};

