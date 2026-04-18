import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js'

dotenv.config();

const generateJWTToken = async(userId, userRole)=>{
    try {
        const payload = {
            id : userId,
            role : userRole
        }

        const secretKey = process.env.JWT_SECRET;

        if(!secretKey)
        {
            throw new ApiError(500,"SERVER ERROR : JWT Secret is not configured.")
        }

        const tokenOption = {
            expiresIn : process.env.JWT_EXPIRES
        }

        const token = jwt.sign(payload,secretKey,tokenOption);

        console.log(`Token Generated Successfully`);
        return token;
    } catch (error) {
        console.log("FAILED to generated token",error)
        throw new ApiError(500,"Error generating authentication token ",error)
    }
}

const verifyToken = asyncHandler(async(req , res , next)=>{
    try {
        const authHeader = req.header("Authorization") || req.header("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Access Denied. Invalid or missing Bearer token.");
        }

        const actualToken = authHeader.split(" ")[1];

        const secretKey = process.env.JWT_SECRET;

        const decodedData = jwt.verify(actualToken,secretKey);

        req.user = decodedData;
        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Session Expired. Please Login Again.", error);
        } else if (error.name === "JsonWebTokenError") {
            throw new ApiError(403, "Invalid Token. Authentication Failed.", error);
        } else {
            throw error; 
        }
    }
})

export{
    generateJWTToken,
    verifyToken
}