import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function addNewUser(data:any){
    await prisma.user.create({data:data});
    console.log("user added",data);
}