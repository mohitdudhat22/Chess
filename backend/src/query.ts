import { GameManager } from './GameManager';
import bcrypt from "bcrypt";
import { prisma } from './utils';
import { Game } from './Game';


export async function addNewUser(email: string, username: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    console.log(username, "<<<<< this is username");
    await prisma.user.create({
        data: {
            email: email,
            password: hash,
            profile: {
                create: {
                    username: username,
                },
            },
        },
        include: {
            profile: true
        }
    });
    console.log("user added", username);
}

export async function getUser(email: string, password: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) {
            console.error("User not found", email);
            throw new Error("User not found");
        } else {
            console.log("User found", email);
        }
        if (!await bcrypt.compare(password, user.password)) {
            console.error("Invalid password", email);
            throw new Error("Invalid password");
        }
        return user;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function createNewGame(gameManager: GameManager, game: Game) {
    const createdGame = await prisma.game.create({
        data: {
            gameId: game.id,
            player1Id: game.player1.userId,
            gameState: JSON.stringify(game),
            player2Id: game.player2.userId,
            player1SocketId: game.player1.socketId,
            player2SocketId: game.player2.socketId,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        },
    }).catch(error => {
        console.error("Error creating game:", error);
        return null;
    });
    console.log(createdGame ,"<<<<<<<<<<<<<<<<<<<<<< DB GAME")
    if (createdGame) {
        await prisma.playerProfile.update({
            where: { userId: game.player1.userId  },
            data: { currentGameId: createdGame.id },
        }).catch(error => {
            console.error("Error updating player1 profile:", error);
        });
        
        await prisma.playerProfile.update({
            where: { userId: game.player2.userId },
            data: { currentGameId: createdGame.id },
        }).catch(error => {
            console.error("Error updating player2 profile:", error);
        });

        console.log(createdGame.id, "<<<< this is created game id");
        gameManager.games.set(createdGame.id, game);
        gameManager.pendingUser = null;
        return createdGame;
    }
    return null;
}

export async function  findExistingGame(userId:string) {
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
    return game;
}

export async function gameDelete(game: Game) {
    await prisma.game.delete({
        where: { gameId: game.id },
    }).catch(error => {
        console.error("Error deleting game:", error);
    });
}