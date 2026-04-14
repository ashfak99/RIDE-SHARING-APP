import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";

const MAX_RETRY =5;
const INITIAL_BACKOFF_DELAY = 1000;
let currentRetryCount =0;

const connectDb = asyncHandler(async(dburl)=>{
    if(mongoose.connection.readyState === 1)
    {
        console.log("Using existing DB connection");
        return;
    }

    try {
        await mongoose.connect(dburl);
        console.log("Database Connected Successfully");
        currentRetryCount=0;
    } catch (error) {
        console.log(`DB Connection Failed : ${error.message}`);

        if(currentRetryCount<MAX_RETRY)
        {
            currentRetryCount++;
            const delay = INITIAL_BACKOFF_DELAY* Math.pow(2,currentRetryCount);
            console.log(`Retrying in ${delay/1000} seconds... Attempt ${currentRetryCount} of ${MAX_RETRY}`);

            await new Promise(resolve => setTimeout(resolve,delay));
            return connectDb(dburl);
        }
        else{
            console.log("Max retry reached. Shutting down application,");
            process.exit(1);
        }
    }
});

mongoose.connection.on('disconnected',()=>{
    console.warn("MongoDB disconnected!");
})

mongoose.connection.on('error',(error)=>{
    console.error("MongoDB runtime error: ", error);
})

const getHealthStatus = () =>{
    return mongoose.connection.readyState===1?"healthy" :"unhealthy";
}

export {
    connectDb,
    getHealthStatus
}