import { GameManager } from './GameManager';
import { WebSocketServer, WebSocket } from 'ws';
import app from './server';
import { getUserIdFromConnection } from './utils';
import { PrismaClient } from '@prisma/client';

const port = 3001;
const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

const prisma = new PrismaClient();

wss.on('connection', async function connection(ws: WebSocket, req: any) {
    const userId = getUserIdFromConnection(req);
    console.log("New connection with userId:", userId);

    if (userId) {
        const isInGame = await prisma.game.findFirst({
            where: {
                OR: [
                    { player1Id: userId },
                    { player2Id: userId },
                ],
            },
        });
        console.log("InGame:", isInGame);
        if (isInGame) {
            console.log("New connection but already exist")
            gameManager.reconnectPlayer(ws, userId);
        } else {
            gameManager.addPlayer(ws, userId);
        }

        ws.on('close', () => console.log('Connection closed'));
        ws.on('error', console.error);
    } else {
        ws.close();
        console.error("Connection rejected: Missing userId");
    }
});


app.listen(port, () => console.log('Server listening on port ' + port));
