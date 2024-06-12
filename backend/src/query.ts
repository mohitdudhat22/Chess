import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { profile } from "console";
const prisma = new PrismaClient();

export async function addNewUser(email: string, username: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    console.log(username,"<<<<<this is username");
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
        include:{
            profile:true
        }
    });
    console.log("user added", username);
}

export async function getUser(email:string ,password:string){
    const user = await prisma.user.findUnique({where:{email:email}});
    if(!user){
        console.log("User not found", email); 
        return null;
    }else{
        console.log("User found", email);
    }
    if(!await bcrypt.compare(password , user.password)) return null;
    return user;
}



