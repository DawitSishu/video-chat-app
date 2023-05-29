import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import {io} from 'socket.io-client';



const socket = io('http://localhost:5000')

const App = () => {
  const [stream,setStream] = useState(null);
  const [userID,setUserID] = useState('');
  const [call,setCall] = useState({});


  const friendVid = useRef();
  const userVid = useRef(); 
  const connection = useRef();


  useEffect(  ()=>{
    //receive the id 
    socket.on("me",id =>{
      setUserID(id)
    })


    const getUserVid = async() =>{
      const userStream = await navigator.mediaDevices.getUserMedia({video: true,})
      userVid.current.srcObject = userStream;
      setStream(userStream);
    }

    //save the call that is sent
    socket.on('callUser',({signal,from,name}) =>{
        setCall({receivingCall:true, signal,callerId : from, callerName : name});
    })


    getUserVid();
    
  },[])



  //answer (respond to)  the call when end user calls
  const answerCall = (id) => {

    //create a peer connection
    const userPeer = new Peer({
      initiator: true,
      trickle:false,
      stream,
    })

    //when a signal is received, respond with peer signal and we have call instance to refer to
    userPeer.on('signal',(data) =>{
      socket.emit('answerCall',{to:call.from,signal:data});
    })
    
    //when we recive the remote-user stream save it locally
    userPeer.on('stream',(userStream) =>{
      friendVid.current.srcObject = userStream;
    });

    //transmit signal data to the enduser
    userPeer.signal(call.signal)

    //save the connection instance of the peer
    connection.current = userPeer;

  }

  

  return (
    <div>
      <h3>current</h3>
      {/* {console.log(userPeerInstance.current)} */}
      <video ref={userVid} autoPlay={true}/>
      <button onClick={callSomeone}>call</button>
    </div>
  )
}

export default App