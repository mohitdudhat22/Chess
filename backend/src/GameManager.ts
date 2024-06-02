import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE } from "./messages";

 
 //Waiting Room
 export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null | any;
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

    public removeUser(socket : WebSocket){
        this.users = this.users .filter((user) => user !== socket);
        //stop the game here because the player left the game
    }

    private addPlayerHandler(socket : WebSocket | any){
        socket.on("message", (data : any)=>{
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
                console.log("player joined");
            }

            if(message.type === MOVE){
                const game = this.games.find((game:any) => game.player1 === socket || game.player2 === socket);
                console.log(game, "<------this is your game");
                if(game){
                    console.log(message, "<------this is your game");
                    if(message.move.from && message.move.to){
                        game.makeMove(socket, message.move);
                    }
                }

            }
        });
    }
    private handleMessage(message: string){

    }

 }