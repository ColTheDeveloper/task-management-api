import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export const generateAccessToken=(userId:string,role:string,tokenType:string,expiresIn:string)=>{
    return jwt.sign(
        {userId,role,tokenType},
        process.env.ACCESS_TOKEN_SECRET as string,
        {expiresIn}
    )
}

export const generateRefreshToken=(userId:string,expiresIn:string)=>{
    return jwt.sign(
        {userId},
        process.env.REFRESH_TOKEN_SECRET as string,
        {expiresIn}
    )
}