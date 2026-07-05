'use client'
import { useFormStatus } from "react-dom";
import { Spinner } from "./ui/spinner";

export function FormLoading() {

    const { pending } = useFormStatus()

    if(!pending) {
        return null
    }

    return <Spinner />
}