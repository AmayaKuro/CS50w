"use client";

import Link from "next/link";


export const Button = ({ children, className = '', ...params}: { 
        children: React.ReactNode,
        className?: string,
    },
) => {
    return (
        <button className={"MuiButton-root " + className} {...params}>
            {children}
        </button>
    );
};