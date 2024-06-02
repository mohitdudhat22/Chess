"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameManager_1 = require("./GameManager");
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const gameManager = new GameManager_1.GameManager();
wss.on('connection', function connection(ws) {
    gameManager.addPlayer(ws);
    ws.on('disconnect', () => gameManager.removeUser(ws));
    ws.on('error', console.error);
});
