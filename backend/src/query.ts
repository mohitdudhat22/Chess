import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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
