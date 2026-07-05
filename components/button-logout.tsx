'use client'
import { ComponentProps } from "react";
import { signOut } from 'next-auth/react'

export function ButtonLogout({children, className}: ComponentProps<"button">) {
    return <button className={className} onClick={() => signOut({redirectTo: `/login`})}>{children}</button>
}