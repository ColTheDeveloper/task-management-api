import request from 'supertest';
import app from '../../app/app'; // Assuming you have an Express app instance exported from app.ts
import pool  from '../../config/db';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv"

dotenv.config()

jest.mock('../../config/db');

let token:string

const secret = process.env.ACCESS_TOKEN_SECRET || 'your_jwt_secret';

beforeAll(async()=>{
    const payload = {
        userId: 1,
        email: 'tester@tester.com',
        role: 'admin'
    };
    token = jwt.sign(payload, secret, { expiresIn: '1h' });
})



// const generateValidToken = () => {
//     const payload = {
//         userId: 1,
//         email: 'tester@tester.com',
//         role: 'admin'
//     };
//     const token = jwt.sign(payload, secret, { expiresIn: '1h' });
//     return token;
// };

// const validToken = generateValidToken();
let validToken
describe('Task Controller', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    describe('getAllTasks', () => {
        it('should fetch all tasks successfully', async () => {
            const mockTasks = [
                { id: 1, title: 'Task 1', description: 'Description 1', due_date: '2023-12-31', user_id: 1 },
                { id: 2, title: 'Task 2', description: 'Description 2', due_date: '2023-12-31', user_id: 1 }
            ];

            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockTasks });

            const response = await request(app)
                .get('/api/v1/tasks')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Tasks fetched successfully",
                data: mockTasks
            });
        });
    });

    describe('createTask', () => {
        it('should create a new task successfully', async () => {
            const mockUser= {
                userId: 1,
                email: 'tester@tester.com',
                role: 'admin'
            };
            const newTask = { title: 'New Task', description: 'Task Description', due_date: '2023-12-31' };
            const mockTask = { id: 1, ...newTask, user_id: 1 };

            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockTask] });

            const response = await request(app)
                .post('/api/v1/tasks')
                .send(newTask)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                message: "Task created successfully",
                data: mockTask
            });
        });
    });

    describe('getUserTasks', () => {
        it('should fetch user tasks successfully', async () => {
            const mockTasks = [
                { id: 1, title: 'Task 1', description: 'Description 1', due_date: '2023-12-31', user_id: 1 },
                { id: 2, title: 'Task 2', description: 'Description 2', due_date: '2023-12-31', user_id: 1 }
            ];

            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockTasks });
            console.log(mockTasks)
            const response = await request(app)
                .get('/api/v1/tasks/user')
                .set('Authorization', `Bearer ${token}`);
                console.log(response.body)
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "User tasks fetched successfully",
                data: mockTasks
            });
        });
    });

    describe('getATask', () => {
        it('should fetch a task successfully', async () => {
            const mockTask = { id: 1, title: 'Task 1', description: 'Description 1', due_date: '2023-12-31', user_id: 1 };

            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockTask] });

            const response = await request(app)
                .get('/api/v1/tasks/1')
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Task fetched successfully",
                data: mockTask
            });
        });

        it('should return 404 if task is not found', async () => {
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .get('/api/v1/tasks/1')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success: false,
                message: "Task not found",
                data: null
            });
        });
    });

    describe('updateTaskStatus', () => {
        it('should update task status successfully', async () => {
            const mockTask = { id: 1, title: 'Task 1', description: 'Description 1', due_date: '2023-12-31', user_id: 1, status: 'pending' };
            const updatedTask = { ...mockTask, status: 'completed' };

            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockTask] });
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [updatedTask] });

            const response = await request(app)
                .put('/api/v1/tasks/1')
                .send({ status: 'completed' })
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            console.log(response.body.data)
            expect(response.body).toEqual({
                success: true,
                message: "Task updated successfully",
                data: updatedTask
            });
        });

        it('should return 404 if task is not found', async () => {
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .put('/api/v1/tasks/1')
                .send({ status: 'completed' })
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success: false,
                message: "Task not found",
                data: null
            });
        });
    });
});