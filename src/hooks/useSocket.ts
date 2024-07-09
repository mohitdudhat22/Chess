'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

// TODO: setup different file for the URL;
// TODO: set the server-side session to the client side
export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { data: session, status } = useSession();
    const userId = session?.user?.id;
    console.log(userId)

    useEffect(() => {
        if (userId) {
            const ws = new WebSocket(`ws://localhost:8080?userId=${userId}`);
            ws.onopen = () => {
                console.log('connected');
                setSocket(ws);
            };
            ws.onclose = () => {
                console.log('disconnected');
                setSocket(null);
            };
            return () => ws.close();
        }
    }, [userId]); // Add userId as a dependency to re-establish the connection when userId changes

    return socket;
};
