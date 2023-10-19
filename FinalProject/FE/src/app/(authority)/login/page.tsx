"use client"
import { signIn } from "next-auth/react";
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { TextField, Button } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { motion } from "framer-motion";

import styles from '../../css/authenticate.module.css'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [disabled, setDisabled] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    
    const router = useRouter()
    
    // import all from react (useEffect here)
    useEffect(() => {
        setError('');
        if (username === '' || password === '') {
            setDisabled(true);
        }
        else {
            setDisabled(false);
        }
    }, [username, password])

    const login = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (disabled) return;
        setLoading(true);

        const res = await signIn('credentials', {
            username: username,
            password: password,
            redirect: false,
        });

        // Nextauth doesn't return error, so we thrown catch-all sentence
        if (res?.error) {
            setError('Unable to sign in');
            setLoading(false);
        } else {
            router.push('/chats');
        }

    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.title}>
                        <h2>Log in</h2>
                    </div>
                    <form onSubmit={login}>
                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="username">Username:</label>
                                <TextField type="text" name="username" placeholder="Username" className={styles.formInput} id="username" onChange={e => setUsername(e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="password">Password:</label>
                                <TextField
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    className={styles.formInput}
                                    id="password"
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            {error !== "" && <div className={styles.formGroup} style={{ color: "#f53e3e" }}>
                                {error}
                            </div>}
                            <LoadingButton className={styles.formGroup} type="submit" loading={loading} disabled={disabled}>
                                Log in
                            </LoadingButton>
                        </div>
                    </form>
                    <div className={styles.footer}>
                        <p>
                            Doesn't have an account?
                        </p>
                        <p>
                            Register <Link href="/register">here</Link>
                        </p>
                    </div>
                </div>
            </main>
        </motion.div>
    )
}