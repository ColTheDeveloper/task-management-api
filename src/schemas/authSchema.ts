import Joi from "joi";


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,15}$/;

export const signupSchema= Joi.object({
    name: Joi.string().min(3).max(20),
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address!',
        'string.empty': 'Email is required!',
    }),
    password: Joi.string().pattern(new RegExp(passwordRegex)).required().messages({
        'string.empty':'Password is required!',
        'string.pattern.base':'Password must be 8-15 characters long and contain at least one lowercase letter, one uppercase letter, one number and one special character!',
    }),
})

export const signinSchema= Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address!',
        'string.empty': 'Email is required!',
    }),
    password: Joi.string().pattern(new RegExp(passwordRegex)).required().messages({
        'string.empty':'Password is required!',
        'string.pattern.base':'Password must be 8-15 characters long and contain at least one lowercase letter, one uppercase letter, one number and one special character!',
    }),
})

export const getOtpSchema= Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address!',
        'string.empty': 'Email is required!',
    })
})
export const resetPasswordSchema= Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address!',
        'string.empty': 'Email is required!',
    }),
    password: Joi.string().pattern(new RegExp(passwordRegex)).required().messages({
        'string.empty':'Password is required!',
        'string.pattern':'Password must be 8-15 characters long and contain at least one lowercase letter, one uppercase letter, one number and one special character!',
    }),
    otp: Joi.string().length(6).required().messages({
        'string.empty':'OTP is required!',
        'string.length':'OTP must be 6 characters long!',
    })
})