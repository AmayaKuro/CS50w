import { Navbar, TitleContainer } from '@/components/navbar'
import { ConversationProvider } from '@/assets/providers/conversation'


export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <ConversationProvider>
            <Navbar>
                <TitleContainer />
            </Navbar>
            <main>
                {children}
            </main>
        </ConversationProvider>
    )
}