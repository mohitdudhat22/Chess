import { PrismaClient } from "@prisma/client";
import { WebSocketServer } from "ws";
import { webSocketPort } from "./config";

// Function to get userId from connection URL
export function getUserIdFromConnection(req: any): string | null {
    const params = new URLSearchParams(new URL(req.url, `http://${req.headers.host}`).search);
    return params.get('userId');
}

export const prisma = new PrismaClient();

const wss = new WebSocketServer({ port: webSocketPort });
export { wss };