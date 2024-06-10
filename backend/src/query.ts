import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

export async function addNewUser(data:any){
    await prisma.user.create({data:data});
    console.log("user added",data);
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

export async function createUserProfile(id:string){
    await prisma.playerProfile.create({data:{data}});
}

