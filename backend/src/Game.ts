import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME } from "./messages";
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

export class Game {
    public player1: { socket: WebSocket, userId: string };
    public player2: { socket: WebSocket, userId: string };
    private board: Chess;
    private moves: string[];
    private startTime: Date;
    public id: string;
    private isEnded: boolean;

    constructor(player1Socket: WebSocket, player1Id: string, player2Socket: WebSocket, player2Id: string) {
        this.id = uuidv4();
        this.player1 = { socket: player1Socket, userId: player1Id };
        this.player2 = { socket: player2Socket, userId: player2Id };
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date();
        this.isEnded = false;

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

        // Check if game should end
        if (this.board.isCheckmate() || this.board.isDraw() || this.board.isInsufficientMaterial() || this.board.isThreefoldRepetition()) {
            this.end();
        } else {
            // Continue game
            this.updateGameState();
        }
    }

    private updateGameState() {
        if (this.board.turn() === 'w') {
            this.player2.socket.send(JSON.stringify({ type: 'state', payload: this.board.fen() }));
            console.log("white moved");
        } else {
            this.player1.socket.send(JSON.stringify({ type: 'state', payload: this.board.fen() }));
            console.log("black moved");
        }
    }

    end() {
        if (this.isEnded) return;

        this.isEnded = true;
        const gameOverMessage = this.board.isDraw() ? 'Draw' : 'Checkmate';

        if (this.player1.socket.readyState === WebSocket.OPEN) {
            this.player1.socket.send(gameOverMessage);
            this.player1.socket.send(JSON.stringify({ type: GAME_OVER, payload: { isCheckmate: this.board.isCheckmate() } }));
        }

        if (this.player2.socket.readyState === WebSocket.OPEN) {
            this.player2.socket.send(gameOverMessage);
            this.player2.socket.send(JSON.stringify({ type: GAME_OVER, payload: { isCheckmate: this.board.isCheckmate() } }));
        }

        // Perform any cleanup or additional logic here
        console.log("Game ended:", gameOverMessage);
    }
}
