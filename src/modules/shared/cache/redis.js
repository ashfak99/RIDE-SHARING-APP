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

const connectRedis = asyncHandler(async()=>{
    try {
        await client.connect();
        console.log(`Redis Connected`)
    } catch (error) {
        console.log(`Fatal Error: Redis connection refused : `,error)
        process.exit(1);
    }
})

const setDriverLocation = asyncHandler(async(driverId, lat, lag)=>{
    try {
        const redisKey = "drivers:active";

        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new Error("Invalid Coordinates");
        }

        await client.geoAdd(redisKey,{
            longitude : lag,
            latitude : lat,
            member : driverId
        });

        console.log("Location Updated for Driver : "+ driverId);
        return true;
    } catch (error) {
        console.log("System Error: Failed to update location for "+driverId)
        console.log(error)
        return false;
    }
})

const findNearestDriver = asyncHandler(async (userLat,userLng,radiusKm)=>{
    try {
        const redisKey = "drivers:active";

        const nearbyDrivers = await client.geoSearch(
            redisKey,
            { longitude : userLng, latitude : userLat },
            { radius : radiusKm, unit : 'km'},
            {WITHDIST : true, SORT : 'ASC', COUNT: 10}
        );

        if(nearbyDrivers === 0){
            console.log("No drivers available in "+radiusKm+" km radius.");
            return [];
        }

        console.log("Found "+nearbyDrivers.length()+" drivers nearby.");
        return nearbyDrivers;
    } catch (error) {
        console.log("System Error: Failed to search nearby drivers.");
        console.log(error);
        return [];
    }
})

const cacheRideSession = asyncHandler(async (rideId,rideDate)=>{
    try {
        const stringifiedData = JSON.stringify(rideDate);
        const redisKey = "ride:session:"+rideId;
        const expiryTimeInSeconds = 3600;
    
        await client.set(redisKey,stringifiedData,{EX : expiryTimeInSeconds});
    
        console.log("Ride session cached successfully with 1-hour TTL. Ride Id : "+rideId);
    
        return true
    } catch (error) {
        console.log("System Error: Failed to cache ride session.");
        console.log(error);
        return false;
    }
})

export {
    connectRedis,
    setDriverLocation,
    findNearestDriver,
    cacheRideSession
}