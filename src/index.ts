import http from "http";
import app from "./app/app";


const server=http.createServer(app)

const PORT=2300

server.listen(PORT,()=>{
    console.log(`Post is running in port ${PORT}`)
})