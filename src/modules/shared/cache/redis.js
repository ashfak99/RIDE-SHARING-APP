import {createClient} from "redis";
import dotenv from "dotenv";
import {asyncHandler} from "../utils/asyncHandler.js";

dotenv.config();

const redisURL =process.env.REDIS_URL;

const client = createClient({
    url : redisURL
});

client.on('connect',()=>{
    console.log(`Redis Client Connected....`)
})

client.on('ready',()=>{
    console.log(`Redis is Ready to Execute Commends....`)
})

client.on('error',(error)=>{
    console.log(`Redis Connection Failed : `+error)
})

client.on('reconnecting',()=>{
    console.log(`Redis Network Glitch!! Reconnecting....`)
})

// (async()=>{
//     await client.connect();
// })();

const connectRedis = asyncHandler(async()=>{
    try {
        await client.connect();
        console.log(`Redis Connected`)
    } catch (error) {
        console.log(`Fatal Error: Redis connection refused : `,error)
        process.exit(1);
    }
})

export {
    connectRedis
}