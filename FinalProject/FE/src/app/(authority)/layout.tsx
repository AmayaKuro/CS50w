import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'


export default function AuthenticationLayout({
    children,
}: {
    children: React.ReactNode
}) {

    // Check if user is logged in
    getServerSession().then((session) => {
        if (session) {
            redirect('/login')
        }
    })

    return (
        <>
            {children}
        </>
    )
}