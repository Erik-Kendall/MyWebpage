// server/utils/CustomError.js

class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name; // Set the name of the error class
        this.statusCode = statusCode || 500; // Default to 500 if no status code is provided

        // Capture stack trace, excluding the constructor call from the stack
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;