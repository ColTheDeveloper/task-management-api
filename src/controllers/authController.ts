import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs"
import pool from "../config/db";
import { createError } from "../middlewares/errorMiddleware";
import { sendEmail } from "../utils/mailer";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";
import jwt from "jsonwebtoken"
import { storeOtp, verifyOtp } from "../utils/otpUtils";



export const signupUser= async (req:Request, res:Response,next:NextFunction) => {
    const {email, password, name}=req.body
    try {
        const userCheck= await pool.query("SELECT * FROM users WHERE email=$1",[email])
        if(userCheck.rows.length>0){
            return next(createError(400,"User already exists"))
        }

        const salt= await bcrypt.genSalt(10)
        const hashedPassword= await bcrypt.hash(password,salt)

        const newUser= await pool.query("INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *",[name,email,hashedPassword])
        
        const verifyToken= generateAccessToken(newUser.rows[0].id,newUser.rows[0].role,"verifyUserToken","5m")

        const verificationLink=`${process.env.BACKEND_URL}/api/v1/auth/verify-email/${verifyToken}`
        await sendEmail({
            to:email as string,
            subject:"Welcome to Task Manager",
            templateName:"verifyEmail",
            replacements:{
                name,
                verificationLink
            }
        })
        res.status(201).json({
            success:true,
            message:"User signed up successfully, an email has been sent to your email address to get verified!",
            data:null
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

export const signinUser= async(req:Request, res:Response,next:NextFunction) => {
    const {email, password}=req.body
    try {
        const result= await pool.query("SELECT * FROM users WHERE email=$1",[email])
        if(result.rows.length===0){
            return next(createError(404,"Invalid credentials"))
        }

        console.log(result.rows)

        const isMatch= await bcrypt.compare(password,result.rows[0].password)
        if(!isMatch){
            return next(createError(404,"Invalid credentials"))
        }
        const user=result.rows[0]

        if(!user.is_verified){
            const verifyToken= generateAccessToken(user.id,user.role,"verifyUserToken","5m")
            const verificationLink=`${process.env.BACKEND_URL}/api/v1/auth/verify-email/${verifyToken}`
            await sendEmail({
                to:email as string,
                subject:"Welcome to Task Manager",
                templateName:"verifyEmail",
                replacements:{
                    name:user.name,
                    verificationLink
                }
            })
            return next(createError(400,"User not verified, an email has been sent to your email address to get verified!"))
        }

        const accessToken= generateAccessToken(user.id,user.role,"accessToken","15m")
        const refreshToken= generateRefreshToken(user.id,"7d",)

        res.cookie("refreshToken",refreshToken,{
            maxAge: 7*24*60*60*1000,
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"none"
        })

        res.json({
            success:true,
            message:"User signed in successfully",
            data:accessToken
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

export const verifyUser= async(req:Request, res:Response,next:NextFunction) => {
    const {token}=req.params
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload;
        if(payload.tokenType!=="verifyUserToken") return next(createError(400,"Invalid token"))
        await pool.query("UPDATE users SET is_verified=true WHERE id=$1", [payload.userId])
        res.json({
            success:true,
            message:"User verified successfully",
            data:null
        })
    } catch (error) {
        console.log(error)
        next(createError(400,"Invalid token"))
    }
}

export const getResetPasswordOtp= async(req:Request, res:Response,next:NextFunction) => {
    const {email}=req.body
    try {
        const result= await pool.query("SELECT * FROM users WHERE email=$1",[email])
        if(result.rows.length===0){
            return next(createError(404,"Invalid credentials"))
        }

        console.log(result.rows)

        const user=result.rows[0]

        const otpCode=storeOtp(email)

        await sendEmail({
            to:email as string,
            subject:"Reset Password",
            templateName:"resetPassword",
            replacements:{
                name:user.name,
                otpCode
            }
        })

        res.status(200).json({
            success:true,
            message:"Reset password OTP has been sent to your email address",
            data:null
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

export const resetPassword=async(req:Request, res:Response,next:NextFunction)=>{
    const {email, otp, password}=req.body
    try {
        const otpVerified= verifyOtp(email,otp)
        if(!otpVerified) return next(createError(400,"Invalid OTP"))

        const salt= await bcrypt.genSalt(10)
        const hashedPassword= await bcrypt.hash(password,salt)

        await pool.query("UPDATE users SET password=$1 WHERE email=$2",[hashedPassword,email])

        res.status(200).json({
            success:true,
            message:"Password reset successfully",
            data:null
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}


export const refreshToken= async(req:Request, res:Response,next:NextFunction) => {
    console.log(req.cookies)
    const refreshToken=req.cookies.refreshToken
    if(!refreshToken) return next(createError(401,"Unauthorized"))

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as jwt.JwtPayload;

        const result= await pool.query("SELECT * FROM users WHERE id=$1",[payload.userId])
        const user=result.rows[0]
        const accessToken= generateAccessToken(user.id,user.role,"accessToken","15m")
        res.json({
            success:true,
            message:"Token refreshed successfully",
            data:accessToken
        })
    } catch (error) {
        console.log(error)
        next(createError(401,"Unauthorized"))
    }
}

export const logout= async(req:Request, res:Response,next:NextFunction) => {
    try {
        res.clearCookie("refreshToken")
        res.json({
            success:true,
            message:"User logged out successfully",
            data:null
        })
    } catch (error) {
        next(error)
    }
}