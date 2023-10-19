"use client"
import Link from 'next/link'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import zxcvbn from 'zxcvbn'

import { TextField, Button, LinearProgress } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { motion } from "framer-motion";

import styles from '../../css/authenticate.module.css'

interface T {
    score: number,
    text: string,
    color: "error" | "warning" | "info" | "success" | undefined,

}

export default function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [error, setError] = useState({
        username: '',
        password: '',
        extra: '',
    })
    const [loading, setLoading] = useState(false)

    const strength = useMemo((): T => {
        if (password === '') {
            return {
                score: 0,
                text: "~~~~",
                color: undefined,
            };
        }

        switch (zxcvbn(password).score) {
            case 0:
                return {
                    score: 0,
                    text: "Very Weak",
                    color: "error",
                };
            case 1:
                return {
                    score: 1,
                    text: "Weak",
                    color: "error",
                };
            case 2:
                return {
                    score: 2,
                    text: "Fair",
                    color: "warning",
                };
            case 3:
                return {
                    score: 3,
                    text: "Good",
                    color: "info",
                };
            case 4:
                return {
                    score: 4,
                    text: "Strong",
                    color: "success",
                };
        }
    }, [password])

    const router = useRouter();


    const addError = useCallback((key: string, value: string) => {
        setError((errors) => {
            return {
                ...errors,
                [key]: value,
            }
        })
    }, [])


    const register = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        const payload = {
            username: username,
            password: password,
        }

        const res = await fetch("http://127.0.0.1:8000/api/register", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (res.status === 400 || res.status === 401) {
            const data = await res.json();

            for (const key in data) {
                addError(key, data[key][0].charAt(0).toUpperCase() + data[key][0].slice(1));
            }
            setLoading(false);
            return;
        }
        else if (res.status === 201) {
            const signin = await signIn('credentials', {
                username: username,
                password: password,
                callbackUrl: 'http://localhost:3000/chats',
            })
        }
        else {
            addError('extra', 'Unable to register');
            setLoading(false);
        }
    }, [username, password, password2])


    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.title}>
                        <h2>Register</h2>
                    </div>
                    <form onSubmit={(e) => register(e)}>
                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="username">Username:</label>
                                <TextField
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    id="username"
                                    onChange={e => {
                                        setUsername(e.target.value)
                                        setError((errors) => {
                                            return {
                                                ...errors,
                                                username: '',
                                            }
                                        })
                                    }}
                                    {...(error.username !== "" && { error: true, helperText: error.username })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="password">Password:</label>
                                <TextField
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    id="password"
                                    color={strength.color}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <div className={styles.strength}>
                                    <p>Strength: {strength.text}</p>
                                    <LinearProgress color={strength.color} variant="determinate" value={strength.score * 25} style={{ borderRadius: "3px" }} />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="re-password">Type password again:</label>
                                <TextField
                                    type="password"
                                    name="password2"
                                    placeholder="Re-Password"
                                    id="re-password"
                                    onChange={e => setPassword2(e.target.value)}
                                    {...(password !== ""
                                        && password2 !== ""
                                        && password !== password2
                                        && { error: true, helperText: "Passwords do not match" }
                                    )}
                                />
                            </div>
                            {error.extra !== "" && <div className={styles.formGroup} style={{ color: "#f53e3e" }}>
                                {error.extra}
                            </div>}
                            <LoadingButton
                                type="submit"
                                className={styles.formGroup}
                                loading={loading}
                                disabled={!username || !!error.username || !password || !password2 || strength.score < 3 || password !== password2}
                            >
                                Register
                            </LoadingButton>
                        </div>
                    </form>
                    <div className={styles.footer}>
                        <p>
                            Already has an account?
                        </p>
                        <p>
                            Login <Link href="/login">here</Link>
                        </p>
                    </div>
                </div>
            </main>
        </motion.div>
    )
}