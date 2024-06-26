import { ExpressAuth } from '@auth/express';
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import express from "express" 

const prisma = new PrismaClient()
 
const app = express();
 
app.set("trust proxy", true)
app.use(
  "/auth/*",
  ExpressAuth({
    providers: [],
    adapter: PrismaAdapter(prisma),
  })
)