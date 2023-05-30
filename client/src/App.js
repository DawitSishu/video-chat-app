import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import {io} from 'socket.io-client';
import { Button, TextField, Typography} from '@mui/material';
// import { makeStyles } from '@mui/styles';
import  './App.css'
import backgroundImage from './background.jpg';

// const useStyles = {
//   container: {
//     height: '100vh',
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//     background: `url(${backgroundImage})`,
//     backgroundSize: 'cover',
//     backgroundPosition: 'center',
//   },
//   title: {
//     color: '#fff',
//     marginBottom: theme.spacing(4),
//     fontWeight: 'bold',
//     fontSize: '2rem',
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     marginBottom: theme.spacing(4),
//   },
//   input: {
//     marginBottom: theme.spacing(2),
//     width: '100%',
//     maxWidth: '300px',
//     background: '#fff',
//     borderRadius: '4px',
//     padding: theme.spacing(1),
//     boxSizing: 'border-box',
//   },
//   button: {
//     width: '100%',
//     maxWidth: '300px',
//   },
//   videoContainer: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: theme.spacing(2),
//     maxWidth: '500px',
//   },
//   video: {
//     width: '100%',
//     borderRadius: '4px',
//     boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.3)',
//   },
// };




const socket = io('http://localhost:5000')

const App = () => {
  const [stream,setStream] = useState(null);
  const [userID,setUserID] = useState('');
  const [call,setCall] = useState(null);
  const [userName,setUserName] = useState('');
  const [inputID,setInputID] = useState('');
  const [inCall,setInCall] = useState(false);


  const friendVid = useRef(); 
  const userVid = useRef(); 
  const connection = useRef();




  useEffect(()=>{
    //receive the id 
    socket.on("me",id =>{
      setUserID(id)
      setUserName(id)
    })


    const getUserVid = async() =>{
      const userStream = await navigator.mediaDevices.getUserMedia({video: true,audio:true})
      setStream(userStream);
      userVid.current.srcObject = userStream;
    }

    //the user is not yet in a call
    setCall(false);

    //save the call that is sent
    socket.on('callUser',({ from, name: callerName, signal}) =>{
        setCall({isReceivingCall: true, from, name: callerName, signal });
    })
    


    getUserVid();
    
  },[])



  //answer (respond to)  the call when end user calls
  const answerCall = () => {

    //create a peer connection
    const userPeer = new Peer({
      initiator: false,
      trickle:false,
      stream,
    })

    //when a signal is received, respond with peer signal and we have call instance to refer to
    userPeer.on('signal',(data) =>{
      socket.emit('answerCall',{ signal: data, to: call.from});
    })
    
    //when we recive the remote-user stream save it locally
    userPeer.on('stream',(userStream) =>{
      friendVid.current.srcObject = userStream;
    });

    //transmit signal data to the enduser
    userPeer.signal(call.signal);

    //save the connection instance of the peer
    connection.current = userPeer;


    //update the call property
    setInCall(true);
  }

  const makeCall = (id) => {
    
    //create a peer connection
    const userPeer = new Peer({
      initiator: true,
      trickle:false,
      stream,
    });
    //when there is a signal call the provided user with the provided signal data
    userPeer.on('signal',(data)=>{
      socket.emit('callUser',{userToCall: id, signal: data, from: userID, name:userName})
    })

    //when we receive the other person stream save it locally
    userPeer.on('stream',(userStream) =>{
      friendVid.current.srcObject = userStream;
    });

    //when the call gets accepted set the signal of the call
    socket.on("callAccepted",(signal)=>{
      userPeer.signal(signal);
      //when the call is accepted update the call property
      setInCall(true);
    })

   //save the connection instance of the peer
   connection.current = userPeer;

  }


  const endCall = () =>{
    //update the call property
    setInCall(false);

    //destroy the connection
    // connection.current.destroy();

    //reload to get another user-ID
    window.location.reload();
  }

  return (
    <div className="container">
      <Typography variant="h4" className="title">
        User ID: {userID}
      </Typography>
      <div className="form">
        <TextField
          label="Call ID"
          variant="outlined"
          value={inputID}
          onChange={(e) => setInputID(e.target.value)}
          className="input"
        />
        <Button variant="contained" color="primary" onClick={() => makeCall(inputID)} className="button">
          Call
        </Button>
        {call && !inCall && (
          <Button variant="contained" color="primary" onClick={answerCall} className="button">
            Answer
          </Button>
        )}
        {inCall && (
          <Button variant="contained" color="secondary" onClick={endCall} className="button">
            End Call
          </Button>
        )}
      </div>
      <div className="videoContainer">
        <video ref={userVid} autoPlay muted className="video" />
        <video ref={friendVid} autoPlay className="video" />
      </div>
    </div>
);
  // )
}

export default App