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

        ws.on('message', async (message: string) => {
            try {
                const parsedMessage = JSON.parse(message);
                if (parsedMessage.type === 'state') {
                    console.log(`Received state from user ${userId}:`, parsedMessage.payload);
                    // Save the state
                    // await gameManager.saveGameState(userId, parsedMessage.payload);
                } else {
                    // Handle other types of messages
                    console.log(`Received message from user ${userId}:`, parsedMessage);
                    // gameManager.handleMessage(userId, parsedMessage);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });

        ws.on('close', () => {
            console.log('Connection closed for user:', userId);
            // gameManager.removePlayer(userId);
        });
        
        ws.on('error', console.error);
    } else {
        ws.close();
        console.error("Connection rejected: Missing userId");
    }
});

app.listen(port, () => console.log('Server listening on port ' + port));