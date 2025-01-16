import pg from "pg"
import dotenv from "dotenv"

dotenv.config()
const {Pool}=pg

console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_HOST:', process.env.DB_HOST);


const pool = new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_DATABASE,
    password:process.env.DB_PASSWORD,
    port:Number(process.env.DB_PORT),
})

pool.connect((err)=>{
    if(err){
        console.error("Database connection error",err.stack)
    }else{
        console.log("Connected to PostgreSQL")
    }
    
})


export default pool