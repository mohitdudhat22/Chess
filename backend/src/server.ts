import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { addNewUser } from './query';
const app = express();

app.use(express.json());

app.get('/signin',(req:Request,res:Response)=>{
    res.send("HEllow wordl")
})

app.post('/signup',async (req:Request,res:Response)=>{
    const {confirmPassword,password,email}=req.body;
    console.log(confirmPassword,password,email);
    const hash = await bcrypt.hash(password , 10);
    console.log(await bcrypt.compare(password , hash));
    console.log(hash);
    console.log(req.body);
    addNewUser({email:email,password:hash});
    res.send("HEllow wordl");
});

export default app;