import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, intValue: T | (() => T)){
    const [value, setValue] = useState(() => {
        const jsonValue = localStorage.getItem(key)
        if(jsonValue){
            return JSON.parse(jsonValue)
        }
        return [] //not very modular but ok in this app
    })

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    return [value, setValue] as [T, React.Dispatch<T>]
}