'use client'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'


export default function Home() {
    const { data: session, status } = useSession()
    const router = useRouter()

    if (status === 'loading') {
        return <div>Loading...</div>
    }
    
    if (status === 'authenticated') {
        router.push("/chats")
    }
}