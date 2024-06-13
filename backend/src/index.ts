import { GameManager } from './GameManager';
import { WebSocketServer } from 'ws';
import app from './server';
const port = 3001;

const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();
wss.on('connection', function connection(ws) {
    gameManager.addPlayer(ws);
    ws.on('disconnect', () =>gameManager.removeUser(ws));
    ws.on('error', console.error);
    });


// here we will make the login and signup page
/*
username
password,
email id,
id,
current game -> game object || undefined
game history { or i can just pass the reference to the played game
each object will reference to the game
    game data
    game result
    chess record
    opponent
    how won
}

*/


//TODO: add custom authentication


app.listen(port,() => console.log('server listening on port ' + port));



