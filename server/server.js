const  app = require("express")();
const server = require("http").createServer(app);
// const dotenv = require("dotenv").config(); 
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


// const app = require("express")();
// const server = require("http").createServer(app);
// const cors = require("cors");

// const io = require("socket.io")(server, {
// 	cors: {
// 		origin: "*",
// 		methods: [ "GET", "POST" ]
// 	}
// });

// app.use(cors());

// const PORT = process.env.PORT || 5000;

// app.get('/', (req, res) => {
// 	res.send('Running');
// });

// io.on("connection", (socket) => {
// 	socket.emit("me", socket.id);

// 	socket.on("disconnect", () => {
// 		socket.broadcast.emit("callEnded")
// 	});

// 	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
// 		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
// 	});

// 	socket.on("answerCall", (data) => {
// 		io.to(data.to).emit("callAccepted", data.signal)
// 	});
// });

// server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));