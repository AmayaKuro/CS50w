import { Navbar, TitleContainer } from '@/components/navbar'
import { ConversationProvider } from '@/assets/providers/conversation'

import styles from '@/css/main/layout.module.css'


export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <ConversationProvider>
            <div id={styles.layout}>
                <Navbar>
                    <TitleContainer />
                </Navbar>
                <main>
                    {children}
                </main>
            </div>
        </ConversationProvider>
    )
}