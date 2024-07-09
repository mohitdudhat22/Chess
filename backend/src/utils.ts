import { GameManager } from './GameManager';
import { PrismaClient } from "@prisma/client";
import { WebSocket, WebSocketServer } from "ws";
import { webSocketPort } from "./config";
import { Game } from './Game';

// Function to get userId from connection URL
export function getUserIdFromConnection(req: any): string | null {
    const params = new URLSearchParams(new URL(req.url, `http://${req.headers.host}`).search);
    return params.get('userId');
}

export const prisma = new PrismaClient();

const wss = new WebSocketServer({ port: webSocketPort });

function updateWebSocket(gameManager:GameManager,game:any,socket: WebSocket, userId:string){
    const player1SocketId = game.player1SocketId;
    const player2SocketId = game.player2SocketId;
    if (userId === game.player1Id) {
        console.log("updated 1")
        gameManager.users.set(player1SocketId, { socket, userId });
    } else if (userId === game.player2Id) {
        console.log("updated 2")
        gameManager.users.set(player2SocketId, { socket, userId });
    }
}
export { wss, updateWebSocket };