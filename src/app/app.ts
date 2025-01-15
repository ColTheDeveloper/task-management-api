import express from "express"
import dotenv from "dotenv"
import "../config/db"
import { globalErrorHandler, routeNotFound } from "../middlewares/errorMiddleware"
import cookieParser from "cookie-parser"
import authRoute from "../routes/authRoutes"
import taskRoute from "../routes/taskRoutes"
import createTaskTable from "../data/createTaskTable"
import createUserTable from "../data/createUserTable"
import swaggerSetup from "../config/swagger"


dotenv.config()


const app= express()

app.use(express.json())
app.use(cookieParser())

swaggerSetup(app)
app.use("/api/v1/auth",authRoute)
app.use("/api/v1/tasks",taskRoute)

createTaskTable()
createUserTable()

app.use(routeNotFound)
app.use(globalErrorHandler)


export default app

