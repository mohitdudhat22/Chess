import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
export class Game {
    public player1: { socket: WebSocket, userId: string };
    public player2: { socket: WebSocket, userId: string };
    private board: Chess;
    private moves: string[];
    private startTime: Date;
    public id: string;

    constructor(player1Socket: WebSocket, player1Id: string, player2Socket: WebSocket, player2Id: string) {
        this.id = uuidv4();
        this.player1 = { socket: player1Socket, userId: player1Id };
        this.player2 = { socket: player2Socket, userId: player2Id };
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date();
        this.player1.socket.send(JSON.stringify({ type: INIT_GAME, payload: { color: "white" } }));
        this.player2.socket.send(JSON.stringify({ type: INIT_GAME, payload: { color: "black" } }));
    }

    makeMove(socket: WebSocket, move: { from: string, to: string }) {
        if ((this.board.turn() !== 'w' && socket === this.player1.socket) || 
            (this.board.turn() !== 'b' && socket === this.player2.socket)) return;
        try {
            this.board.move(move);
            console.log("move made", move);
        } catch (error) {
            console.log(error); 
            return;
        }
        if (this.board.isCheckmate() || this.board.isGameOver()) {
            this.board.turn() === 'w' ? this.player1.socket.send('Checkmate') : this.player2.socket.send('Checkmate');
            this.player1.socket.send(JSON.stringify({ type: GAME_OVER, payload: { isCheckmate: this.board.isCheckmate() } }))
        }
        if(this.board.turn() !== 'w'){
            this.player2.socket.send(JSON.stringify({ type: 'state', payload: this.board.fen() }));
            console.log("white moved");
        }else{
            this.player1.socket.send(JSON.stringify({ type: 'state', payload: this.board.fen()}));
            console.log("black moved");
        }
    }
}
