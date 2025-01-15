import request from 'supertest';
import  app  from '../../app/app'; // Assuming you have an Express app instance exported from app.ts
import  pool  from '../../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storeOtp, verifyOtp } from '../../utils/otpUtils';
import { sendEmail } from '../../utils/mailer'
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';

jest.mock('../../config/db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../utils/mailer');
jest.mock('../../utils/otpUtils');
jest.mock('../../utils/generateToken');

beforeEach(()=>{
    jest.resetAllMocks()
})

describe('Auth Controller - Sign In', () => {
    beforeEach(()=>{
        jest.resetAllMocks()
    })
    
    describe("Sign In User",()=>{
        it('should sign in a user successfully', async () => {
            const mockUser = {
                id: 11,
                email: 'tester@tester.com',
                password: '$2a$10$MEykxRn0BgtQdMARuV8V9uvTgecFLczdZ0pp9OUk4yetcGdhumtkq',
                role: 'user',
                is_verified: true
            };
    
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });
            (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
            (generateAccessToken as jest.Mock).mockReturnValueOnce('accessToken');
            (generateRefreshToken as jest.Mock).mockReturnValueOnce('refreshToken');
    
            const response = await request(app)
                .post('/api/v1/auth/sign-in')
                .send({ email: 'tester@tester.com', password: 'Tester12$' });
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "User signed in successfully",
                data:  'accessToken'
            });
            expect(response.headers['set-cookie'][0]).toContain('refreshToken=refreshToken');
        });
    
        it('should return 404 if login credential is wrong', async () => {
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    
            const response = await request(app)
                .post('/api/v1/auth/sign-in')
                .send({ email: 'john.doe@example.com', password: 'Password123$' });
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success:false,
                message: "Invalid credentials",
                data:null
            });
        });
    
        it('should return 400 with error message for password', async () => {
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    
            const response = await request(app)
                .post('/api/v1/auth/sign-in')
                .send({ email: 'john.doe@example.com', password: 'password123$' });
    
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Password must be 8-15 characters long and contain at least one lowercase letter, one uppercase letter, one number and one special character!")
        });

        it('should return 400 if user is not verified', async () => {
            const mockUser = {
                id: 11,
                email: 'tester@tester.com',
                password: '$2a$10$MEykxRn0BgtQdMARuV8V9uvTgecFLczdZ0pp9OUk4yetcGdhumtkq',
                role: 'user',
                is_verified: false,
                name: 'Tester'
            };

            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });
            (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
            (generateAccessToken as jest.Mock).mockReturnValueOnce('verifyToken');
            (sendEmail as jest.Mock).mockResolvedValueOnce(true);

            const response = await request(app)
                .post('/api/v1/auth/sign-in')
                .send({ email: 'tester@tester.com', password: 'Tester12$' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                success: false,
                message: "User not verified, an email has been sent to your email address to get verified!",
                data: null
            });
            expect(sendEmail).toHaveBeenCalledWith({
                to: 'tester@tester.com',
                subject: "Welcome to Task Manager",
                templateName: "verifyEmail",
                replacements: {
                    name: 'Tester',
                    verificationLink: `${process.env.BACKEND_URL}/api/v1/auth/verify-email/verifyToken`
                }
            });
        });

    });

    describe('Get Reset Password OTP', () => {
        it('should send reset password OTP successfully', async () => {
            const mockUser = {
                id: 1,
                email: 'tester@tester.com',
                name: 'tester'
            };
    
            (pool.query as jest.Mock).mockResolvedValueOnce({rows:[mockUser]});
            (storeOtp as jest.Mock).mockReturnValueOnce('123456');
            (sendEmail as jest.Mock).mockResolvedValueOnce(true);
    
            const response = await request(app)
                .post('/api/v1/auth/get-reset-password-otp')
                .send({ email: 'tester@tester.com' });
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Reset password OTP has been sent to your email address",
                data:null
            });
            expect(storeOtp).toHaveBeenCalledWith('tester@tester.com');
            expect(sendEmail).toHaveBeenCalledWith({
                to: 'tester@tester.com',
                subject: "Reset Password",
                templateName: "resetPassword",
                replacements: {
                    name: 'tester',
                    otpCode: '123456'
                }
            });
        });
    
        it('should return 404 if user is not found', async () => {
        
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
        
            const response = await request(app)
                .post('/api/v1/auth/get-reset-password-otp')
                .send({ email: 'john.doe@example.com' });
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success:false,
                message: "Invalid credentials",
                data:null
            });
        })
    
    })

    describe('Reset Password', () => {
        it('should reset the password successfully', async () => {
            const mockUser = {
                id: 1,
                email: 'tester@tester.com',
                password: '$2a$10$MEykxRn0BgtQdMARuV8V9uvTgecFLczdZ0pp9OUk4yetcGdhumtkq',
                role: 'user',
                is_verified: true
            };
    
            (verifyOtp as jest.Mock).mockReturnValueOnce(true);
            (bcrypt.genSalt as jest.Mock).mockResolvedValueOnce('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });
    
            const response = await request(app)
                .put('/api/v1/auth/reset-password')
                .send({ email: 'tester@tester.com', otp: '123456', password: 'NewPassword123$' });
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Password reset successfully",
                data: null
            });
        });
    
        it('should return 400 if OTP is invalid', async () => {
            (verifyOtp as jest.Mock).mockReturnValueOnce(false);
    
            const response = await request(app)
                .put('/api/v1/auth/reset-password')
                .send({ email: 'tester@tester.com', otp: '123456', password: 'NewPassword123$' });
    
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                success: false,
                message: "Invalid OTP",
                data: null
            });
        });
    
        it('should return 500 if there is a server error', async () => {
            (verifyOtp as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Internal Server Error');
            });
    
            const response = await request(app)
                .put('/api/v1/auth/reset-password')
                .send({ email: 'john.doe@example.com', otp: '123456', password: 'NewPassword123$' });
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                message: "Internal Server Error",
                data: null
            });
        });
    });

    describe("Sign Up User", () => {
        it('should sign up a user successfully', async () => {
            const newUser = {
                id: 11,
                email: 'tester@tester.com',
                name: 'Tester',
                password: 'hashedPassword',
                role: 'user'
            };

            (pool.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [] }) // Check if user exists
                .mockResolvedValueOnce({ rows: [newUser] }); // Insert new user
            (bcrypt.genSalt as jest.Mock).mockResolvedValueOnce('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');
            (generateAccessToken as jest.Mock).mockReturnValueOnce('verifyToken');
            (sendEmail as jest.Mock).mockResolvedValueOnce(true);

            const response = await request(app)
                .post('/api/v1/auth/sign-up')
                .send({ email: 'tester@tester.com', password: 'Tester12$', name: 'Tester' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                message: "User signed up successfully, an email has been sent to your email address to get verified!",
                data: null
            });
            expect(sendEmail).toHaveBeenCalledWith({
                to: 'tester@tester.com',
                subject: "Welcome to Task Manager",
                templateName: "verifyEmail",
                replacements: {
                    name: 'Tester',
                    verificationLink: `${process.env.BACKEND_URL}/api/v1/auth/verify-email/verifyToken`
                }
            });
        });

        it('should return 400 if user already exists', async () => {
            const existingUser = {
                id: 11,
                email: 'tester@tester.com',
                name: 'Tester',
                password: 'hashedPassword',
                role: 'user'
            };

            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [existingUser] });

            const response = await request(app)
                .post('/api/v1/auth/sign-up')
                .send({ email: 'tester@tester.com', password: 'Tester12$', name: 'Tester' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                success: false,
                message: "User already exists",
                data: null
            });
        });

        it('should return 500 if there is a server error', async () => {
            (pool.query as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Internal Server Error');
            });

            const response = await request(app)
                .post('/api/v1/auth/sign-up')
                .send({ email: 'tester@tester.com', password: 'Tester12$', name: 'Tester' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                message: "Internal Server Error",
                data: null
            });
        });
    });

    describe("Verify User",()=>{
        it('should verify a user successfully', async () => {
            const mockUser = {
                id: 11,
                email: 'tester@tester.com',
                role: 'user',
                is_verified: false
            };

            const token = jwt.sign({ userId: mockUser.id, tokenType: 'verifyUserToken' }, process.env.ACCESS_TOKEN_SECRET || 'test_secret');

            (jwt.verify as jest.Mock).mockReturnValueOnce({ userId: mockUser.id, tokenType: 'verifyUserToken' });
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

            const response = await request(app)
                .get(`/api/v1/auth/verify-email/${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "User verified successfully",
                data: null
            });
        });

        it('should return 400 if token is invalid', async () => {
            const token = 'invalidToken';

            (jwt.verify as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });

            const response = await request(app)
                .get(`/api/v1/auth/verify-email/${token}`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                success: false,
                message: "Invalid token",
                data: null
            });
        });

        it('should return 400 if token type is incorrect', async () => {
            const mockUser = {
                id: 11,
                email: 'tester@tester.com',
                role: 'user',
                is_verified: false
            };

            const token = jwt.sign({ userId: mockUser.id, tokenType: 'wrongTokenType' }, process.env.ACCESS_TOKEN_SECRET || 'test_secret');

            (jwt.verify as jest.Mock).mockReturnValueOnce({ userId: mockUser.id, tokenType: 'wrongTokenType' });

            const response = await request(app)
                .get(`/api/v1/auth/verify-email/${token}`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                success: false,
                message: "Invalid token",
                data: null
            });
        });
    })

    describe("Refresh Token", () => {
        it('should refresh the token successfully', async () => {
            const mockUser = {
                id: 11,
                email: 'tester@tester.com',
                role: 'user',
                is_verified: true
            };

            const refreshToken = jwt.sign({ userId: mockUser.id }, process.env.REFRESH_TOKEN_SECRET || 'test_secret');
            const accessToken = 'newAccessToken';

            (jwt.verify as jest.Mock).mockReturnValueOnce({ userId: mockUser.id });
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });
            (generateAccessToken as jest.Mock).mockReturnValueOnce(accessToken);

            const response = await request(app)
                .get('/api/v1/auth/refresh-token')
                .set('Cookie', `refreshToken=${refreshToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Token refreshed successfully",
                data: accessToken
            });
        });

        it('should return 401 if refresh token is missing', async () => {
            const response = await request(app)
                .get('/api/v1/auth/refresh-token');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false,
                message: "Unauthorized",
                data: null
            });
        });

        it('should return 401 if refresh token is invalid', async () => {
            const refreshToken = 'invalidToken';

            (jwt.verify as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });

            const response = await request(app)
                .get('/api/v1/auth/refresh-token')
                .set('Cookie', `refreshToken=${refreshToken}`);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false,
                message: "Unauthorized",
                data: null
            });
        });

    });
});
