"use client";

import { Redirect } from "next";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";


export const Button = ({ children, className = '', ...params }: {
    children: React.ReactNode,
    className?: string,
},
) => {
    return (
        <button className={"MuiButton-root " + className} onClick={e => signOut()} {...params}>
            {children}
        </button>
    );
};