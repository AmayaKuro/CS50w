import LinearProgress from '@mui/material/LinearProgress';

import UserMessage from './response/UserMessage';
import Wrapper from './response/Wrapper';

export const CreateResponseLoading: React.FC<{ message?: string }> = ({ message }) => {

    return (
        <div >
            <UserMessage message={message} />
            <Wrapper>
                <LinearProgress color="info" style={{borderRadius: "1rem"}} />
            </Wrapper>
        </div>

    );
};

