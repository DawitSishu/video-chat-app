import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import {io} from 'socket.io-client';



const socket = io('http://localhost:5000')

const App = () => {
  const [stream,setStream] = useState(null);
  const [userID,setUserID] = useState();


  const friendVid = useRef();
  const userVid = useRef(); 


  const callSomeone = async() => {
    const userPeer = new Peer({
      initiator: true,
      trickle:false,
      stream,
    })
    console.log(userPeer)
  }

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


    getUserVid();
    
  },[])

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