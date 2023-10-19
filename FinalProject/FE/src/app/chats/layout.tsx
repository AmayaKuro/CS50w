import { Navbar, TitleContainer } from '@/components/navbar'


export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div>
            {/* TODO: put nav bar contain conversations title, main board display conversation here */}
            <Navbar>
                <TitleContainer />
            </Navbar>
            <main>
                {children}
            </main>
        </div>
    )
}