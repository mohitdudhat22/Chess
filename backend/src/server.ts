import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { addNewUser, getUser } from './query';
import { profile } from 'console';
import { create } from 'domain';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {z } from 'zod'
import {validateRequest } from './middleware';
const app = express();

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
const addNewUserSchema = z.object(
    {
        email: z.string().email(),
        password: z.string().min(6),
        }
    // username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/)
)

//TODO : Add OTP system
app.post('/signin',validateRequest(addNewUserSchema),async (req:Request, res:Response)=>{
    const {password,email}=req.body;
    
    console.log('Password:', password);
    console.log('Email:', email);
    const user =  await getUser(email , password);
    if (user) {
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not set');
        }
        const token = jwt.sign({ id: user.id, email: user.email,password:user.password }, JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
        res.status(200).json({ token ,message : "user signed in successfully and token is setted"});
    }else {
        res.status(401).send('Invalid email or password');
    }
})

app.post('/signup',async (req:Request,res:Response)=>{
    const {confirmPassword,password,email,username}=req.body;
    console.log(req.body);
    await addNewUser(email,username, password);
    res.send("User added successfully");
});

export default app;