import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private moves: string[];
    private startTime: Date;
    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date();
        this.player1.send(JSON.stringify({ type: INIT_GAME, payload: { color: "white" } }));
        this.player2.send(JSON.stringify({ type: INIT_GAME, payload: { color: "black" } }));
    }
    makeMove(socket: WebSocket, move: { from: string, to: string }) {
        if (this.board.turn() !== 'w' && socket === this.player1 || this.board.turn() !== 'b' && socket === this.player2) return;
        try {
            this.board.move(move);
        } catch (error) {
            console.log(error); 
            return;
        }
        //update the board
        //push the move
        //check if the game is over
        if (this.board.isCheckmate() || this.board.isGameOver()) {
            //send the updated board to both players
            this.board.turn() === 'w' ? this.player1.send('Checkmate') : this.player2.send('Checkmate');
            this.player1.send(JSON.stringify({ type: GAME_OVER, payload: { isCheckmate: this.board.isCheckmate() } }))
        }
        //send the updated board to both players   
        if(this.board.turn() !== 'w'){
            this.player2.send(JSON.stringify({ type: MOVE, payload: move }));
            console.log("white moved");
        }else{
            this.player1.send(JSON.stringify({ type: MOVE, payload: move }));
            console.log("black moved");
        }
    }
}