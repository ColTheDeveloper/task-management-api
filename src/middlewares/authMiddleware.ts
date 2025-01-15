import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { createError } from "./errorMiddleware"

export const AuthCheck=async(req:Request,res:Response,next:NextFunction)=>{
    const bearerToken=req.headers.authorization
    if(!bearerToken) return next(createError(401,"Token is required"))
    
    const token=bearerToken.split(" ")[1]
    if(!token) return next(createError(401,"Token is required"))

    try {
        const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload

        req.userId=decoded.userId
        req.userRole=decoded.role

        next()
    } catch (error) {
        next(createError(401, "Invalid token"));
        
    }
}

export const authorizedRole=(allowedRoles:string[])=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        const role=req.userRole

        if(!role)return next(createError(403,"Access denied!"))

        if(allowedRoles.includes(role)){
            next()
        }else{
            return next(createError(403,"Access denied!"))
        }
    }
}