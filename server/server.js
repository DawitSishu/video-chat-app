const  app = require("express")();
const server = require("http").createServer(app);
const dotenv = require("dotenv").config(); 
const cors = require("cors");

const PORT = process.env.PORT || 5000

const io = require("socket.io")(server,{
    cors :{
        origin : "*"
    }
});

app.use(cors());

app.get('/', (req,res) =>{
    res.json("okay")
})
io.on("connection" ,socket =>{
    console.log('someone connected...');
    
    //send the socket-id for the user ro use
    socket.emit("me", socket.id);


    // respond to call user event when a peron call and send the necessary data to the other user
    socket.on("callUser",({userToCall,signal,from,name}) =>{
        io.to(userToCall).emit("callUser",{signal,from,name});
    })

    // when someone calls send our signal-data to the person who called
    socket.on("answerCall",({to,signal}) => {
        io.to(to).emit("callAccepted",signal);
    })



})



server.listen(PORT,()=>console.log(`server running on port ${PORT}...`))