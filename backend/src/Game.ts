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

        //here after the every move update the gameState in game Model
        if ((this.board.turn() === 'w' && socket !== this.player1.socket) || 
            (this.board.turn() === 'b' && socket !== this.player2.socket)) return;

        try {
            const moveResult = this.board.move(move);
            console.log("game object ------------------------------------------------->" , this.board)
            if (moveResult) {
                this.moves.push(this.board.fen());
                this.updateGameState();
                this.checkGameEnd();
            }
        } catch (error) {
            console.error("Invalid move:", error);
        }
    }

    private updateGameState() {
        const fen = this.board.fen();
        if (this.board.turn() === 'w') {
            if (this.player2.socket.readyState === WebSocket.OPEN) {
                this.player2.socket.send(JSON.stringify({ type: 'state', payload: fen }));
            }
        } else {
            if (this.player1.socket.readyState === WebSocket.OPEN) {
                this.player1.socket.send(JSON.stringify({ type: 'state', payload: fen }));
            }
        }
    }

    private checkGameEnd() {
        if (this.board.isCheckmate() || this.board.isDraw() || this.board.isInsufficientMaterial() || this.board.isThreefoldRepetition()) {
            this.end();
        }
    }

    end() {
        if (this.isEnded) return;

        this.isEnded = true;
        const gameOverMessage = this.board.isDraw() ? 'Draw' : 'Checkmate';

        if (this.player1.socket.readyState === WebSocket.OPEN) {
            this.player1.socket.send(JSON.stringify({ type: GAME_OVER, payload: { message: gameOverMessage, isCheckmate: this.board.isCheckmate() } }));
        }

        if (this.player2.socket.readyState === WebSocket.OPEN) {
            this.player2.socket.send(JSON.stringify({ type: GAME_OVER, payload: { message: gameOverMessage, isCheckmate: this.board.isCheckmate() } }));
        }

        console.log("Game ended:", gameOverMessage);
    }
}
