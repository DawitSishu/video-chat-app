import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import {io} from 'socket.io-client';



const socket = io('http://localhost:5000')

const App = () => {
  const [stream,setStream] = useState(null);
  const [userID,setUserID] = useState('');
  const [call,setCall] = useState(null);
  const [userName,setUserName] = useState('');
  const [inputID,setInputID] = useState('');


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

    //when we receive the other person stream saveit locally
    userPeer.on('stream',(userStream) =>{
      friendVid.current.srcObject = userStream;
    });

    //when the call gets accepted set the signal of the call
    socket.on("callAccepted",(signal)=>{
      userPeer.signal(signal);
    })

   //save the connection instance of the peer
   connection.current = userPeer;

  }

  return (
    <div>
      <h1>user-id: {userID}</h1>
      <input value={inputID} onChange={e=>setInputID(e.target.value)} />
      <button onClick={() =>makeCall(inputID)}>call</button>
      {console.log(call)}
      {call&& <button onClick={answerCall}>answer</button> }
      <h3>current</h3>
      <video ref={userVid} autoPlay={true} muted/>
      <h3>remote</h3>
      <video ref={friendVid} autoPlay={true} />
    </div>
  )
}

export default App