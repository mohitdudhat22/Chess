'use client';
import { useEffect, useState } from 'react';

// TODO: setup different file for the url;
//TDOO: set the serverside session to the client side
export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    
    useEffect(()=>{
        const ws = new WebSocket('ws://localhost:8080');
        ws.onopen = () => {
            console.log('connected');
            setSocket(ws);
        }
        ws.close = () => {
            console.log('disconnected');
            setSocket(null);
        }
        return ()=>ws.close();
    },[]);
    return socket;
}
