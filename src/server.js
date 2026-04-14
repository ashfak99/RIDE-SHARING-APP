import express from "express";
import dotenv from "dotenv";
import {connectDb} from "./modules/shared/database/mongodb.js";
import { connectRedis } from "./modules/shared/cache/redis.js";


dotenv.config();

const app =express();
const port = process.env.PORT || 3000;
const url = process.env.MONGODB_URI;

connectDb(url);
connectRedis();

app.listen(port,()=>{
    console.log(`Server Start at PORT ${port}`);
})