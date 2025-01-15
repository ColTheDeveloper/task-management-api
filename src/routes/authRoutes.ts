import { getResetPasswordOtp, logout, refreshToken, resetPassword, signinUser, signupUser, verifyUser } from "../controllers/authController"
import express from "express"
import validateMiddleware  from "../middlewares/validateMiddleware";
import { getOtpSchema, resetPasswordSchema, signinSchema, signupSchema } from "../schemas/authSchema";


const router= express.Router()

router.post("/sign-up",validateMiddleware(signupSchema),signupUser);
router.post("/sign-in",validateMiddleware(signinSchema),signinUser);
router.get("/verify-email/:token",verifyUser);
router.post("/get-reset-password-otp",validateMiddleware(getOtpSchema),getResetPasswordOtp);
router.put("/reset-password",validateMiddleware(resetPasswordSchema),resetPassword);
router.get("/refresh-token",refreshToken);
router.get("/log-out",logout)





export default router