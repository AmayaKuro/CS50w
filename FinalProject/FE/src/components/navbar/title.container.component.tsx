import Link from 'next/link';



const TitleContainer: React.FC = () => {
    // TODO: Call API to get conversations in here
    const conversations = [{
        "conversation_id": 1,
        "title": "Conversation 1"
    }]
    return (
        <div>
            {conversations.map((conversation) => (
                <div key={conversation.conversation_id}>
                    <Link href={`${conversation.conversation_id}`}>
                        {conversation.title}
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default TitleContainer;
