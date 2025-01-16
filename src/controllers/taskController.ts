import pool from "../config/db";
import { NextFunction, Request, Response } from "express";
import { createError } from "../middlewares/errorMiddleware";


export const getAllTasks=async(req:Request,res:Response,next:NextFunction)=>{
    const { status, start_date, end_date, sort_by, sort_order,page } = req.query;


    let limit
    let offset


    let query = "SELECT * FROM tasks WHERE 1=1";
    let countQuery = "SELECT COUNT(*) FROM tasks WHERE 1=1";
    const queryParams: any[] = [];
    const countQueryParams: any[] = [];

    if (status) {
        query += " AND status = $1";
        countQuery += " AND status = $1";
        queryParams.push(status);
        countQueryParams.push(status);
    }

    if (start_date) {
        query += queryParams.length ? " AND due_date >= $" + (queryParams.length + 1) : " AND due_date >= $1";
        countQuery += countQueryParams.length ? " AND due_date >= $" + (countQueryParams.length + 1) : " AND due_date >= $1";
        queryParams.push(start_date);
        countQueryParams.push(start_date);
    }

    if (end_date) {
        query += queryParams.length ? " AND due_date <= $" + (queryParams.length + 1) : " AND due_date <= $1";
        countQuery += countQueryParams.length ? " AND due_date <= $" + (countQueryParams.length + 1) : " AND due_date <= $1";
        queryParams.push(end_date);
        countQueryParams.push(end_date);
    }

    if (sort_by) {
        query += ` ORDER BY ${sort_by}`;
        if (sort_order) {
            query += ` ${sort_order}`;
        }
    } else {
        query += " ORDER BY created_at DESC"; // Default sorting by creation date
    }

    if(page){
        limit=10
        offset=(parseInt(page as string,10)-1)*limit
    }

    if (limit) {
        query += ` LIMIT $${queryParams.length + 1}`;
        queryParams.push(limit);
    }

    if (offset) {
        query += ` OFFSET $${queryParams.length + 1}`;
        queryParams.push(offset);
    }
    try {
        const result= await pool.query(query,queryParams)
        const tasks=result.rows

        if(page){
            const countResult = await pool.query(countQuery, countQueryParams);
            const totalTasks = parseInt(countResult.rows[0].count, 10);

            const totalPages=Math.ceil(totalTasks/(limit || 10))

            res.status(200).json({
                success:true,
                message:"User tasks fetched successfully",
                data:{
                    tasks,
                    totalTasks,
                    totalPages
                }
            })
        }else{
            res.status(200).json({
                success:true,
                message:"Tasks fetched successfully",
                data:tasks
            })

        }

    } catch (error) {
        next(error)
    }
}

export const createTask=async(req:Request,res:Response,next:NextFunction)=>{
    const {title,description,due_date}=req.body
    const userId=req.userId
    try {
        const result = await pool.query("INSERT INTO tasks (title,description,due_date,user_id) VALUES ($1,$2,$3,$4) RETURNING *", [title,description,due_date,userId])
        const task=result.rows[0]

        res.status(201).json({
            success:true,
            message:"Task created successfully",
            data:task
        })
    } catch (error) {
        next(error)
    }
}

export const getUserTasks=async(req:Request,res:Response,next:NextFunction)=>{
    const userId=req.userId
    const { status, start_date, end_date, sort_by, sort_order, page } = req.query;

    let limit
    let offset

    let query = "SELECT * FROM tasks WHERE user_id = $1";
    let countQuery = "SELECT COUNT(*) FROM tasks WHERE user_id=$1";
    const queryParams: any[] = [userId];
    const countQueryParams: any[] = [userId];

    if (status) {
        query += " AND status = $" + (queryParams.length + 1);
        countQuery += " AND status = $" + (countQueryParams.length + 1);
        queryParams.push(status);
        countQueryParams.push(status);
    }

    if (start_date) {
        query += queryParams.length ? " AND due_date >= $" + (queryParams.length + 1) : " AND due_date >= $1";
        countQuery += countQueryParams.length ? " AND due_date >= $" + (countQueryParams.length + 1) : " AND due_date >= $1";
        queryParams.push(start_date);
        countQueryParams.push(start_date);
    }

    if (end_date) {
        query += queryParams.length ? " AND due_date <= $" + (queryParams.length + 1) : " AND due_date <= $1";
        countQuery += countQueryParams.length ? " AND due_date <= $" + (countQueryParams.length + 1) : " AND due_date <= $1";
        queryParams.push(end_date);
        countQueryParams.push(end_date);
    }

    if (sort_by) {
        query += ` ORDER BY ${sort_by}`;
        if (sort_order) {
            query += ` ${sort_order}`;
        }
    } else {
        query += " ORDER BY created_at DESC"; // Default sorting by creation date
    }

    if(page){
        limit=10
        offset=(parseInt(page as string,10)-1)*limit
    }

    if (limit) {
        query += ` LIMIT $${queryParams.length + 1}`;
        queryParams.push(limit);
    }

    if (offset) {
        query += ` OFFSET $${queryParams.length + 1}`;
        queryParams.push(offset);
    }
    try {
        const result= await pool.query(query,queryParams)
        const tasks=result.rows

        if(page){
            const countResult = await pool.query(countQuery, countQueryParams);
            const totalTasks = parseInt(countResult.rows[0].count, 10);

            const totalPages=Math.ceil(totalTasks/(limit || 10))

            res.status(200).json({
                success:true,
                message:"User tasks fetched successfully",
                data:{
                    tasks,
                    totalTasks,
                    totalPages
                }
            })
        }else{
            res.status(200).json({
                success:true,
                message:"User tasks fetched successfully",
                data:tasks
            })
        }

    } catch (error) {
         
        next(error)
    }
}

export const getATask=async(req:Request, res:Response, next:NextFunction)=>{
    const taskId=req.params.taskId
    const userId=req.userId
    const userRole=req.userRole
    try {
        const result= await pool.query("SELECT * FROM tasks WHERE id=$1",[taskId])
        const task=result.rows[0]

        if(!task) return next(createError(404,"Task not found"))

        if(task.user_id !== userId && userRole !== "admin" && userRole !== "manager" ) return next(createError(403,"Access denied"))

        res.status(200).json({
            success:true,
            message:"Task fetched successfully",
            data:task
        })
        
    } catch (error) {
        next(error)
    }
}


export const updateTaskStatus=async(req:Request,res:Response,next:NextFunction)=>{
    const {status,title,description,due_date}=req.body
    const taskId=req.params.taskId
    const userRole=req.userRole
    
    try {
        const getTaskResult = await pool.query("SELECT * FROM tasks WHERE id=$1",[taskId])
        const task=getTaskResult.rows[0]
        if(!task) return next(createError(404,"Task not found"))

        if(task.user_id !== req.userId && userRole !== "admin" && userRole !== "manager" ) return next(createError(403,"Access denied"))

        const updates: { [key: string]: any } = { status, title, description, due_date };
        const fields: string[] = [];
        const values: any[] = [];
        let query = "UPDATE tasks SET ";

        Object.keys(updates).forEach((key, index) => {
            if (updates[key as keyof typeof updates] !== undefined) {
                fields.push(`${key}=$${index + 1}`);
                values.push(updates[key]);
            }
        });

        if (fields.length === 0) return next(createError(400, "No valid fields to update"));

        query += fields.join(", ");
        query += ` WHERE id=$${fields.length + 1} RETURNING *`;
        values.push(taskId);

        const getUpdatedTaskResult = await pool.query(query, values);
        const updatedTask = getUpdatedTaskResult.rows[0];
    

        res.status(200).json({
            success:true,
            message:"Task updated successfully",
            data:updatedTask
        })
    } catch (error) {
        next(error)
    }
}

export const deleteTask=async(req:Request,res:Response,next:NextFunction)=>{
    const taskId=req.params.taskId
    const userRole=req.userRole
    try {
        const getTaskResult = await pool.query("SELECT * FROM tasks WHERE id=$1",[taskId])
        const task=getTaskResult.rows[0]
        if(!task) return next(createError(404,"Task not found"))

        if(task.user_id !== req.userId && userRole !== "admin" ) return next(createError(403,"Access denied"))

        await pool.query("DELETE FROM tasks WHERE id=$1",[taskId])

        res.status(200).json({
            success:true,
            message:"Task deleted successfully",
            data:null
        })
    } catch (error) {
        next(error)
    }
}
