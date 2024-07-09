import { GameManager } from './GameManager';
import { WebSocket } from 'ws';
import app from './server';
import { getUserIdFromConnection, prisma, wss } from './utils';
import { port } from './config';
import { findExistingGame } from './query';

const gameManager = new GameManager();

wss.on('connection', async function connection(ws: WebSocket, req: any) {
    const userId = getUserIdFromConnection(req);
    console.log("New connection with userId:", userId);

    if (userId) {
        const isInGame = await findExistingGame(userId);
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
