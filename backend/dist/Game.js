"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.moves = [];
        this.startTime = new Date();
        this.player1.send(JSON.stringify({ type: messages_1.INIT_GAME, payload: { color: "white" } }));
        this.player2.send(JSON.stringify({ type: messages_1.INIT_GAME, payload: { color: "black" } }));
    }
    makeMove(socket, move) {
        if (this.board.turn() !== 'w' && socket === this.player1 || this.board.turn() !== 'b' && socket === this.player2)
            return;
        try {
            this.board.move(move);
        }
        catch (error) {
            console.log(error);
            return;
        }
        //update the board
        //push the move
        //check if the game is over
        if (this.board.isCheckmate() || this.board.isGameOver()) {
            //send the updated board to both players
            this.board.turn() === 'w' ? this.player1.send('Checkmate') : this.player2.send('Checkmate');
            this.player1.send(JSON.stringify({ type: messages_1.GAME_OVER, payload: { isCheckmate: this.board.isCheckmate() } }));
        }
        //send the updated board to both players   
        if (this.board.turn() !== 'w') {
            this.player2.send(JSON.stringify({ type: messages_1.MOVE, payload: move }));
            console.log("white moved");
        }
        else {
            this.player1.send(JSON.stringify({ type: messages_1.MOVE, payload: move }));
            console.log("black moved");
        }
    }
}
exports.Game = Game;
