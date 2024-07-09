import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE } from "./messages";
import { v4 as uuidv4 } from 'uuid';
import { createNewGame, findExistingGame } from "./query";
import { prisma, updateWebSocket } from "./utils";


export class GameManager {
    public games: Map<string, Game>;
    public pendingUser: { socket: WebSocket, userId: string, socketId: string } | null;
    public users: Map<string, { socket: WebSocket, userId: string }>; // socketId , { socket, userId }

    constructor() {
        this.games = new Map();
        this.pendingUser = null;
        this.users = new Map();
    }

    public async addPlayer(socket: WebSocket, userId: string) {
        const socketId = uuidv4();
        this.users.set(socketId, { socket, userId });
        this.addPlayerHandler(socket, socketId, userId);
    }

    public async removeUser(socket: WebSocket) {
        // Finding and removing the user via the socket in memory
        const userEntry = Array.from(this.users.entries()).find(([_, user]) => user.socket === socket);
        if (!userEntry) return;
        const [socketId, user] = userEntry;
        this.users.delete(socketId);

        const game = Array.from(this.games.values()).find(game =>
            game.player1.socket === user.socket || game.player2.socket === user.socket
        );

        if (game) {
            game.end();
            this.games.delete(game.id);
            await prisma.game.delete({
                where: { gameId: game.id },
            }).catch(error => {
                console.error("Error deleting game:", error);
            });
        }
    }

    protected addPlayerHandler(socket: WebSocket, socketId: string, userId: string) {
        socket.on("message", async (data: WebSocket) => {
            const message = JSON.parse(data.toString());

            if (message.type === INIT_GAME) {
                if (this.pendingUser) {
                    if(this.pendingUser.userId !== userId){
                        const game = new Game(this.pendingUser.socket, this.pendingUser.userId, this.pendingUser.socketId ,socket, userId, socketId);
                        const createdGame = await createNewGame(this, game);
                    }else {
                        console.log("Users are same");
                    }
                }else {
                    this.pendingUser = { socket, userId, socketId };
                }    


            if (message.type === MOVE) {
                const game = Array.from(this.games.values()).find(game =>
                    game.player1.socket === socket || game.player2.socket === socket
                );
                if (game && message.move?.from && message.move?.to) {
                    game.makeMove(socket, message.move);
                }
            }
        }
        });

        socket.on("close", async () => {
            console.log("connection closed here");
            // await this.removeUser(socket);
        });

        socket.on("error", (error) => {
            console.error("WebSocket error:", error);
        });
    }

    public async reconnectPlayer(socket: WebSocket, userId: string) {
        const game = await findExistingGame(userId);
        console.log("game for reconnection ------------------>", game);
        if (game) {
            const restoredGame = this.games.get(game.id);
            console.log("restoredGame -----------------------?",restoredGame);
            if (restoredGame) {
                updateWebSocket(this,game,socket,userId);
                socket.send(JSON.stringify({ type: 'reinit_game' }));
                console.log(`Reconnected player ${userId} to game ${game.gameId}`);
            } else {
                console.error("Failed to find the game in memory.");
            }
        } else {
            console.error(`No game found for userId ${userId}`);
        }
    }
}
