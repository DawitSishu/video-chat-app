const  app = require("express")();
const server = require("http").createServer(app);
const dotenv = require("dotenv").config(); 

const PORT = process.env.PORT || 5000

const io = require("socket.io")(server,{
    cors :{
        origin : "*"
    }
});

// app.get('/', (req,res) =>{
//     res.json("okay")
// })
io.on("connection" ,socket =>{
    console.log('someone connected...')
})



server.listen(PORT,()=>console.log(`server running on port ${PORT}...`))