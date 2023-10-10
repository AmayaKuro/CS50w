'use client'
import Link from 'next/link'
import { redirect, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

import styles from './page.module.css'
import { useEffect } from 'react'


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