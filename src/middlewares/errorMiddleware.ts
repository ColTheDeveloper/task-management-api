import { Response, Request, NextFunction } from 'express';

class CustomError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export const createError = (status: number, message: string) => {
    return new CustomError(status, message);
}

// Middleware to handle not found routes
export const routeNotFound = (req: Request, res: Response, next: NextFunction) => {
    const err = new CustomError(404,`Route ${req.originalUrl} not found`);
    next(err);
};


export const globalErrorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        data:null
    });
};