import { GameManager } from './GameManager';
import { WebSocketServer, WebSocket } from 'ws';
import app from './server';
import { URL } from 'url'; // Import URL module

const port = 3001;
const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

wss.on('connection', function connection(ws: WebSocket, req: any) {
    const userId = getUserIdFromConnection(req);
    console.log(userId,">>>>>>>>>>>>>>>>>>>> UserId")
    if (userId) {
        gameManager.addPlayer(ws, userId);
        ws.on('close', () => gameManager.removeUser(ws));
        ws.on('error', console.error);
    } else {
        ws.close();
        console.error("Connection rejected: Missing userId");
    }
});

// Function to get userId from connection URL
function getUserIdFromConnection(req: any): string | null {
    const params = new URLSearchParams(new URL(req.url, `http://${req.headers.host}`).search);
    return params.get('userId');
}

app.listen(port, () => console.log('Server listening on port ' + port));
