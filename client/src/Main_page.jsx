import React, { useState, useEffect } from 'react'
import { UserContext } from './App'
import { useContext } from 'react'
import { UserContext_mess } from './App'
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { RiChatSmile3Line } from "react-icons/ri";
// import { Document, Page } from '@react-pdf-viewer/react-pdf';


// import './index.css'
// pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;


const socket = io.connect('http://localhost:8000');

export const Prompt = () => {

  const { userName, setUsername } = useContext(UserContext)
  const { room, setRoom } = useContext(UserContext)
  // console.log(userName)
  const route = useNavigate()
  const [inputValue, setInputValue] = useState({
    userName: ""
  });
  const sendName = () => {
    setUsername(inputValue.userName)
    console.log("ewrerer", `${inputValue.userName}`)
    socket.emit('join_room', { usern: inputValue.userName, room: room });
    // socket.emit('left_room',{ usern: inputValue.userName, room: room })
  };

  //Join Room
  // const joinRoom = () => {
  //   if (room !== '' && userName !== '') {
  //     setUsername(inputValue.userName)
  //     console.log(inputValue.userName)
  //     console.log("dbhsbdsh")

  //     socket.emit('join_room', { userName: inputValue.userName, room });
  //   }


  // };

  useEffect(() => {
    socket.on('nameReceived', (response) => {
      socket.join(room);
      console.log(response); // Log the response from the server
    });

    return () => {
      socket.off('nameReceived');
    };
  }, []);

  const handleChange = (e) => {
    const newUser = { ...inputValue }
    newUser[e.target.id] = e.target.value;
    setInputValue(newUser);
    console.log(newUser)
  };



  const handleSubmit = (e) => {

    e.preventDefault();

    // Do something with the submitted value
    console.log('Submitted value:', inputValue);
    console.log("hujndkshcu ", userName);
    route("/main_page")
  };





  // export default function Form() {
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input onChange={(e) => handleChange(e)} id="userName" type="text" value={inputValue.userName} className='input' placeholder='Username' />
        {/* <input type="password" className="input" placeholder='Password'/> */}
        {/* <div className="checkbox"> */}
        {/* <input type="checkbox" id="check" /> */}
        {/* <label htmlFor='check'> Keep me sign in</label> */}

        {/* </div> */}
        <select name='select' id='select' onChange={(event) => setRoom(event.target.value)}>
          <option hidden selected>--Select Room--</option>
          <option value='1'>Room1</option>
          <option value='2'>Room2</option>
          <option value='3'>Room3</option>
          <option value='4'>Room4</option>
        </select>
        <div className="sign-in-button">
          <button onClick={sendName} type="submit" className='sign-in'>Join Room</button>
          {/* <p>Forget Password <span>Sign UP!</span></p> */}
        </div>
      </form>
    </div>
  )
}
// }





export function Main_page() {
  const { userName } = useContext(UserContext)
  const { room, setRoom } = useContext(UserContext)
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState([]);
  const [msg, setmsg] = useState("")
  const [chat, setChat] = useState([])
  const [file,setFile] =useState(null);

  useEffect(() => {
    socket.on('new_message', (messageData) => {
      // console.log(sent_user," sent message")
      console.log(messageData)
      // console.log(chat)
      if (messageData.socketId === socket.id) {
        console.log("Message should be in right")
      }
      else {
        console.log("Message should be in left")

      }

      setChat((prevchat) => [...prevchat, messageData])
    });

    socket.on("joined_user", (message) => {
      // setuserEntered(message);
      setChat((preventry) => [...preventry, message])
      console.log("chat@@ ", message)

    });

    socket.on('image', (base64String) => {
      console.log('1')
      // const Uint8Array=base64String;
      console.table(base64String)
      // const byteArray = new Uint8Array(atob(base64String).split('').map(char => char.charCodeAt(0)));
      // const blob = new Blob([byteArray],{type:'image/*'});
      // const imageURL=URL.createObjectURL(blob)
      // console.log(imageURL)

      //working code
      // setUrl([...url,base64String])

      //changes
      setChat((previmg) => [...previmg, base64String])


    });

    socket.on('file_uploaded',(data)=>{
      console.log(data.message);

    })

    


    return () => {
      //  socket.emit('left_room',{ usern: inputValue.userName, room: room })
      socket.off('new_message');
      socket.off('joined_user');
      socket.off('image');
      
    }
  }, [socket, url]);


  function handleSubmit(e) {
    e.preventDefault();
    const socketId = socket.id
    document.getElementById('mess').value = '';
    socket.emit('new_message', { message: msg, socketId: socketId, user: userName, room: room, type: 'msg' });
    setmsg("");
  }

  const handleImage = (e) => {
    e.preventDefault()
    const file = e.target.files[0];
    const reader = new FileReader();
    // console.log(e.target.files[0])
    reader.onload = (e) => {
      // const buffer=new Uint8Array(e.target.result);
      // const blob= new Blob([buffer],{type:file.type})
      setImage(e.target.result);
    };

    reader.readAsDataURL(file);
  }

  const handleUpload = (e) => {
    e.preventDefault();

    socket.emit('image', { room: room, buffer: image, socketId: socket.id, user: userName, type: 'img' });
    // setImage([]);

    setImage(null)
  };

  const handleFile =(e) =>{
    e.preventDefault();
    setFile(e.target.files[0]);
  }

  const UploadFile =(e) =>{
    e.preventDefault();
    if(file){
      const reader=new FileReader();

      reader.onload = () =>{
        const arrayBuffer =reader.result;
        const data = new Uint8Array(arrayBuffer);
        console.log(arrayBuffer)
        console.log(data)
        const chunckSize =1024;

        for(let i=0;i<data.length;i+=chunckSize){
          const chunk = data.slice(i,i+chunckSize);
          socket.emit('file_upload',{chunk,fileName:file.name});
        }
        socket.emit('file_upload_complete',{room:room});

      };
      reader.readAsArrayBuffer(file);

    }
  }

  



  // const pdfUrl = ''

  // console.log(url)
  return (
    <div className='background'>
      <div className="user_nav">
        {userName}
      </div>
      <div className="message-container">
        <div>
          {chat.map((item, index) => (
            <div>
             
              {/* <div className="emoji">
                <RiChatSmile3Line className='logo' />
              </div> */}
              {item.type === 'msg' ? (
                <div className={socket.id === item.socketId ? "me" : "you"} key={index}>
                  <div className="emoji">
                    <RiChatSmile3Line className='logo' />
                  </div>
                  <div className="mess">

                    <div className="name_display">
                      {item.user}
                    </div>
                    {item.message}
                  </div>
                </div>
              ) : (item.type === 'img' || item.type === 'entry') ? (
                <div>
                    {item.type === 'img' ? (
                    <div className={socket.id === item.socketId ? "me" : "you"} key={index}>
                      <div className="emoji">
                        <RiChatSmile3Line className='logo' />
                      </div>
                      <div className="mess">
                        <div className="name_display">
                          {item.user}
                        </div>
                        <img  key={index} src={item.buffer} alt="Uploaded" style={{ maxWidth: '300px', maxHeight: '300px' }} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className={item.user_detail === '' ? "self" : "joining"}>{item.user_detail}</div>
                      </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>


      </div>
      <form  onSubmit={handleSubmit} >
        <div className="input-box">

          <input type='text' id="mess" name="mess"
            value={msg}
            onChange={(e) => setmsg(e.target.value)} />
          <button type='submit'>Submit</button>
        </div>
      </form>
      {/* <button type='submit' id='left' onClick={leaveRoom}>Leave room</button> */}
      <form>
        <input type='file' accept='image/*' onChange={handleImage} />
        <button onClick={handleUpload}>Upload Image</button>
        <input type='file' accept='/*' onChange={handleFile}/>
        <button onClick={UploadFile}>Upload File</button>
        <div>
    </div>
      </form>
    </div>
  )
}

