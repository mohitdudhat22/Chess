import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE } from "./messages";

 
 //Waiting Room
 export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor(){
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    
    addPlayer(socket : WebSocket){
        this.users.push(socket);
        //adding second player
        this.addPlayerHandler(socket);
    }

    removeUser(socket : WebSocket){
        this.users = this.users .filter((user) => user !== socket);
        //stop the game here because the player left the game
    }

    private addPlayerHandler(socket : WebSocket){
        socket.on("message", (data)=>{
            const message = JSON.parse(data.toString());
            if(message.type === INIT_GAME){
                if(this.pendingUser){
                    //start the game here
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }else{
                    this.pendingUser = socket;
                }
            }

            if(message.type === MOVE){
                const game =this.games.find((game) => game.player1 === socket || game.player2 === socket);
                if(game){
                    if(message.data.from && message.data.to){
                        game.makeMove(socket, message.data);
                    }
                }

            }
        });
    }
    private handleMessage(message: string){

    }

 }