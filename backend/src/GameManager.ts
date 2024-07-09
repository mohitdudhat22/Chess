import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE } from "./messages";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class GameManager {
    private games: Map<string, Game>;
    private pendingUser: { socket: WebSocket, userId: string, socketId: string } | null;
    private users: Map<string, { socket: WebSocket, userId: string }>; // socketId , { socket, userId }

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
            console.log(game.id, "<<<<<<<<<<<<<<<<<<<this is the game which we wanted to delete");
            this.games.delete(game.id);
            await prisma.game.delete({
                where: { gameId: game.id },
            }).catch(error => {
                console.error("Error deleting game:", error);
            });
        }
    }

    private addPlayerHandler(socket: WebSocket, socketId: string, userId: string) {
        socket.on("message", async (data: WebSocket) => {
            const message = JSON.parse(data.toString());

            if (message.type === INIT_GAME) {
                const existingGame = await prisma.game.findFirst({
                    where: {
                        OR: [
                            { player1Id: userId },
                            { player2Id: userId },
                        ],
                    },
                }).catch(error => {
                    console.error("Error finding existing game:", error);
                    return null;
                });

                if (existingGame) {
                    console.log(`Player ${userId} already in an existing game. Reconnecting...`);
                    // this.updatePlayerSocket(socket, existingGame, userId);
                } else if (this.pendingUser) {
                    const game = new Game(this.pendingUser.socket, this.pendingUser.userId, socket, userId);

                    const createdGame = await prisma.game.create({
                        data: {
                            gameId: game.id,
                            player1Id: this.pendingUser.userId,
                            gameState: JSON.stringify(game),
                            player2Id: userId,
                            player1SocketId: this.pendingUser.socketId,
                            player2SocketId: socketId,
                            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
                        },
                    }).catch(error => {
                        console.error("Error creating game:", error);
                        return null;
                    });
                    console.log(this.pendingUser.userId ,"<<<<<<<<<<<<<<<<<<<<<< this is userId")
                    if (createdGame) {
                        await prisma.playerProfile.update({
                            where: { userId: this.pendingUser.userId },
                            data: { currentGameId: createdGame.id },
                        }).catch(error => {
                            console.error("Error updating player1 profile:", error);
                        });
                        
                        await prisma.playerProfile.update({
                            where: { userId: userId },
                            data: { currentGameId: createdGame.id },
                        }).catch(error => {
                            console.error("Error updating player2 profile:", error);
                        });

                        console.log(createdGame.id, "<<<< this is created game id");
                        this.games.set(createdGame.id, game);
                        this.pendingUser = null;
                    }
                } else {
                    this.pendingUser = { socket, userId, socketId };
                }
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
            console.log("connection closed here");
            // await this.removeUser(socket);
        });

        socket.on("error", (error) => {
            console.error("WebSocket error:", error);
        });
    }

    public async reconnectPlayer(socket: WebSocket, userId: string) {
        const game = await prisma.game.findFirst({
            where: {
                OR: [
                    { player1Id: userId },
                    { player2Id: userId },
                ],
            },
        }).catch(error => {
            console.error("Error finding game for reconnection:", error);
            return null;
        });

        console.log(this.users);
        console.log(this.games)
        if (game) {
            console.log("you already exist in game table, you have to continue the game");
            const restoredGame = this.games.get(game.id);
            console.log(restoredGame);
            if (restoredGame) {
                const player1SocketId = game.player1SocketId;
                const player2SocketId = game.player2SocketId;

                // Update the user's WebSocket connection
                if (userId === game.player1Id) {
                    this.users.set(player1SocketId, { socket, userId });
                    // this.addPlayerHandler(socket, player1SocketId, userId);
                } else if (userId === game.player2Id) {
                    this.users.set(player2SocketId, { socket, userId });
                    // this.addPlayerHandler(socket, player2SocketId, userId);
                }

                // Send initial game state to the reconnected player
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
