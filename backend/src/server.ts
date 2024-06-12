import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { addNewUser, getUser } from './query';
import { profile } from 'console';
import { create } from 'domain';
const app = express();

app.use(express.json());

//TODO :add OTP system
app.post('/signin',async (req:Request, res:Response)=>{
    const {password,email}=req.body;
    console.log(password,email);
    console.log(await getUser(email , password));
    console.log(req.body);
    res.send("HEllow wordl");
})

app.post('/signup',async (req:Request,res:Response)=>{
    const {confirmPassword,password,email,username}=req.body;
    console.log(req.body);
    await addNewUser(email,username, password);
    res.send("Success");
});

export default app;