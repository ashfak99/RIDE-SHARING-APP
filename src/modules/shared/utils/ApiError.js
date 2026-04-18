class ApiError extends Error {
    constructor(
        statusCode,
        message,
        Errors = [],
        stack = ''
    ){
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.Errors = Errors;
        this.success = false;
        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {ApiError};