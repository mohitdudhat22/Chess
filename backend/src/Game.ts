import { Chess } from "chess.js";

export class Game{
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private moves: string[];
    private startTime: Date;
    constructor(player1: WebSocket, player2: WebSocket){
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves  = [];
        this.startTime = new Date();
    }
    makeMove(socket:WebSocket ,move: {from:string, to:string}){
        if(this.board.turn() !== 'w' && socket === this.player1 || this.board.turn() !== 'b' && socket === this.player2) return;
        try {
            this.board.move(move);
            
        } catch (error) {
            return;
        }
        //update the board
        //push the move
        //check if the game is over
        if(this.board.isCheckmate()){
            //send the updated board to both players
            this.board.turn() === 'w' ? this.player1.send('Checkmate') : this.player2.send('Checkmate');
        }
        //send the updated board to both players                
    }
}