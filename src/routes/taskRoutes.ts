import { createTask, deleteTask, getAllTasks, getATask, getUserTasks, updateTaskStatus } from "../controllers/taskController"
import express from "express"
import { AuthCheck, authorizedRole } from "../middlewares/authMiddleware"
import validateMiddleware from "../middlewares/validateMiddleware"
import { createTaskSchema, updateTaskStatusSchema } from "../schemas/taskSchema"

const router=express.Router()

router.get("/",AuthCheck,authorizedRole(["manager","admin"]),getAllTasks)

router.post("/",validateMiddleware(createTaskSchema),AuthCheck,authorizedRole(["user","manager","admin"]),createTask)

router.get("/user",AuthCheck,authorizedRole(["user","manager","admin"]),getUserTasks)

router.get("/:taskId",AuthCheck,authorizedRole(["user","manager","admin"]),getATask)

router.put("/:taskId",validateMiddleware(updateTaskStatusSchema),AuthCheck,authorizedRole(["user","manager","admin"]),updateTaskStatus)

router.delete("/:taskId",AuthCheck,authorizedRole(["user","admin"]),deleteTask)


export default router