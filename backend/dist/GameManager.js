"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("./Game");
const messages_1 = require("./messages");
//Waiting Room
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addPlayer(socket) {
        this.users.push(socket);
        //adding second player
        this.addPlayerHandler(socket);
    }
    removeUser(socket) {
        this.users = this.users.filter((user) => user !== socket);
        //stop the game here because the player left the game
    }
    addPlayerHandler(socket) {
        socket.on("message", (data) => {
            var _a, _b;
            const message = JSON.parse(data.toString());
            console.log(message, "this is the message");
            if (message.type === messages_1.INIT_GAME) {
                if (this.pendingUser) {
                    //start the game here
                    const game = new Game_1.Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket;
                }
                console.log("player joined");
            }
            if (message.type === messages_1.MOVE) {
                const game = this.games.find((game) => game.player1 === socket || game.player2 === socket);
                console.log(game, "<------this is your game");
                if (game) {
                    console.log(message, "<------this is your game");
                    if (((_a = message.move) === null || _a === void 0 ? void 0 : _a.from) && ((_b = message.move) === null || _b === void 0 ? void 0 : _b.to)) {
                        game.makeMove(socket, message.move);
                    }
                }
            }
        });
    }
    handleMessage(message) {
    }
}
exports.GameManager = GameManager;
