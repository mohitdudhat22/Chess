'use client';
import { useMyContext } from '@/Context/MyContextProvider';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

// TODO: setup different file for the URL;
// TODO: set the server-side session to the client side
// TODO: add kafka to make it more real time and to reduce its latancy
export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { data: session, status } = useSession();
    const userId = session?.user?.id;
    console.log(userId);
    const {chessState} = useMyContext();


    useEffect(() => {
        if (userId) {
            const ws = new WebSocket(`ws://localhost:8080?userId=${userId}`);
            
            ws.onopen = () => {
                console.log('connected');
                setSocket(ws);
            };
    
            ws.onclose = (event) => {
                console.log('WebSocket closed');
                setSocket(null);
            };
    
            // Periodic state saving
            const intervalId = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({type: 'state', payload: chessState}));
                }
            }, 5000); // Save state every 5 seconds
    
            // Attempt to save state when page is about to unload
            const handleBeforeUnload = () => {
                ws.send(JSON.stringify({type: 'state', payload: chessState}));
            };
    
            window.addEventListener('beforeunload', handleBeforeUnload);
    
            return () => {
                clearInterval(intervalId);
                window.removeEventListener('beforeunload', handleBeforeUnload);
                ws.close();
            };
        }
    }, [userId, chessState]);
    return socket;
};
