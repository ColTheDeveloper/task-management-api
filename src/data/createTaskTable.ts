import pool from "../config/db"

const createTaskTable=async()=>{
    try {
        const query=`
            CREATE TABLE IF NOT EXISTS tasks(
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                due_date TIMESTAMP,
                status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','in-progress','completed')),
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `
        await pool.query(query)
    } catch (error) {
        console.log(error)
    }
}

export default createTaskTable