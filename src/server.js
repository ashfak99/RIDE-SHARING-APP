import express from "express";
import dotenv from "dotenv";
import {connectDb} from "./modules/shared/database/mongodb.js";
import { connectRedis } from "./modules/shared/cache/redis.js";
import { generateJWTToken } from "./modules/shared/auth/jwt.js";


dotenv.config();

const app =express();
const port = process.env.PORT || 3000;
const url = process.env.MONGODB_URI;

connectDb(url);
connectRedis();

const token = generateJWTToken(253004,"Driver");

app.listen(port,()=>{
    console.log(`Server Start at PORT ${port}`);
})