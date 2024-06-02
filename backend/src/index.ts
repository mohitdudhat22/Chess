import { GameManager } from './GameManager';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();
wss.on('connection', function connection(ws) {
    gameManager.addPlayer(ws);
    ws.on('disconnect', () =>gameManager.removeUser(ws));
    ws.on('error', console.error);
});