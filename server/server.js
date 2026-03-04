const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');

//create express app and HTTP server
const app = express();
const server = http.createServer(app); // Create HTTP server because Socket.IO needs it

//middlewares setup
app.use(express.json({limit: '5mb'}));//we can send json data with max size of 5mb
app.use(cors());  //it will allow all the url to the backend

app.use("/api/status",(req,res)=> res.send("Server is running"));//it will check the server is running or not


const PORT = process.env.PORT || 5000;//it will check the port is given in env file or not if not then it will use 5000
server.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})
