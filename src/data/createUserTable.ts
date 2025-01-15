import pool from "../config/db"


const createUserTable=async()=>{
    try {
        const query=`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                is_verified BOOLEAN DEFAULT FALSE,
                role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user','admin','manager')),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `

        await pool.query(query)
    } catch (error) {
        console.error("Error creating user table:",error)
    }
}


export default createUserTable