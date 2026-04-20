import { ApiError } from "./ApiError.js";
import { logger } from "./logger.js";

const envVariable = process.env.NODE_ENV;

const globalErrorHandler = (err, req , res, next)=>{
    let currentError = err;

    if(currentError.code === 11000)
    {
        const customMessage = "This email/phone is already registered";

        currentError= new ApiError(400,customMessage);
    }

    if(!(currentError instanceof ApiError))
    {
        const statusCode = currentError.statusCode || 500;
        const message = currentError.message || "Something Went Wrong";

        currentError = new ApiError(statusCode,message,false,currentError.stack);
    }


    if(currentError.name === "CastError")
    {
        const customMessage = "Invalid Database ID format.";
        currentError = new ApiError(400,customMessage);
    }

    if(currentError.name === "JsonWebTokenError")
    {
        currentError = new ApiError(401,"You token is invalid, Accessed Denied.")
    }

    if(currentError.name === "TokenExpiredError")
    {
        currentError = new ApiError(401, "Your Token is Expired. Please Login Again")
    }

    const logMsg = `${currentError.statusCode} - ${currentError.message} - ${req.originalUrl} - ${req.method} -${req.ip}`;
    
    logger.error(logMsg);

    const responsePayload = {
        success : false,
        message : currentError.message
    }

    if(envVariable === 'development')
    {
        responsePayload.stack = currentError.stack;
    }else if(envVariable === 'production')
    {
        if (currentError.statusCode===500) {
            responsePayload.message = "Internal Server Error";
        }
    }

    return res.status(currentError.statusCode).json(responsePayload);
}

export {
    globalErrorHandler
}