import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE } from "./messages";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class GameManager {
    private games: Map<string, Game>;
    private pendingUser: { socket: WebSocket, userId: string } | null;
    private users: Map<string, { socket: WebSocket, userId: string }>;

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

    public async removeUser(socketId: string) {
        const user = this.users.get(socketId);
        if (!user) return;

        this.users.delete(socketId);
        
        const game = Array.from(this.games.values()).find(game =>
            game.player1.socket === user.socket || game.player2.socket === user.socket
        );
        if (game) {
            game.end(); // Assuming you have an `end()` method in your `Game` class
            this.games.delete(game.id);
            await prisma.game.delete({
                where: { id: game.id },
            });
        }

        await prisma.activeSession.deleteMany({
            where: {
                socketId: socketId,
            },
        });
    }

    private addPlayerHandler(socket: WebSocket, socketId: string, userId: string) {
        socket.on("message", async (data: WebSocket) => {
            const message = JSON.parse(data.toString());

            if (message.type === INIT_GAME) {
                if (this.pendingUser) {
                    const game = new Game(this.pendingUser.socket, socket);


                    
                    const createdGame = await prisma.game.create({
                        data: {
                            player1Id: this.pendingUser.userId,
                            player2Id: userId,
                            player1SocketId: JSON.stringify(this.pendingUser.socket),
                            player2SocketId: JSON.stringify(socket),
                        },
                    });
                    console.log(createdGame.id)
                    // this.games.set(createdGame.id, game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = { socket, userId };
                    //creating activeSession in database for new Player
                    await prisma.activeSession.create({
                        data: {
                            playerId: userId,
                            socketId: socketId,
                        },
                    });
                }
                console.log("Player joined");
            }

            if (message.type === MOVE) {
                const game = Array.from(this.games.values()).find(game =>
                    game.player1.socket === socket || game.player2.socket === socket
                );
                if (game && message.move?.from && message.move?.to) {
                    game.makeMove(socket, message.move);
                }
            }
        });

        socket.on("close", async () => {
            await this.removeUser(socketId);
        });

        socket.on("error", (error) => {
            console.error("WebSocket error:", error);
        });
    }

    public async reconnectPlayer(socket: WebSocket, userId: string) {
        const activeSession = await prisma.activeSession.findFirst({
            where: {
                playerId: userId,
            },
        });

        if (activeSession) {
            const socketId = activeSession.socketId;
            this.users.set(socketId, { socket, userId });
            this.addPlayerHandler(socket, socketId, userId);

            const game = await prisma.game.findFirst({
                where: {
                    OR: [
                        { player1Id: userId },
                        { player2Id: userId },
                    ],
                },
            });

            if (game) {
                // Restore game state and send to the player
            }
        }
    }
}
