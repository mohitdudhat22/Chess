import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

export class Game {
    //TODO : here two players get connected to each other via the socket annonamsoly and i want do not want to connect annanomosly toeach other
    /* here we will be set the users id along with websocket */
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
            // createUsersMove(this.player1,this.board);
            // createUsersMove(this.player2,this.board);
            //after every move we need to store the game in side of the database in side of the current game



            console.log("move made",move);
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
            this.player2.send(JSON.stringify({ type: 'state', payload: this.board.fen() }));
            console.log("white moved");
        }else{
            this.player1.send(JSON.stringify({ type: 'state', payload: this.board.fen()}));
            console.log("black moved");
        }


        //TODO : here if chess game get completed then we add this match to the history of the user and make the game terminate and disconnect the socket

        //TODO: here if chess game player get disconncoted then here will add feature to continue the match [after 30 seconds termination of the game] 

        //TODO: user should not be able to play multiple games at once
    }
}