import React, { useRef, useState } from 'react';
import './App.css';

import { app, auth } from './Firebase'

import * as Firestore from 'firebase/firestore'
import * as FirebaseAuth from 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import Popup from './Other Components/Popup';
import { async } from '@firebase/util';
import { getDoc } from 'firebase/firestore';

const appName = 'FireLink'



// React app component
function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        {!user ? <SignIn/> : <SignOut/>}
        <div className="App-title">{appName}</div>
      </header>

      <section>
        {user ? <ChatRoom/> : <WelcomePage/>}
      </section>
    </div>
  )
}

function WelcomePage() {
  return (
    <>
      <div className='App-welcome'>Welcome to {appName}!</div><br/>
      <div className='App-creator'>Created by Joseph Evans</div>
    </>
  )
}

// Sign-in component
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new FirebaseAuth.GoogleAuthProvider();
    FirebaseAuth.signInWithPopup(auth, provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

// Sign-out component
function SignOut() {
  return auth.currentUser && (
    <button onClick={() => FirebaseAuth.signOut(auth)}>Sign Out</button>
  )
}

// Chatroom component
function ChatRoom() {
  const dummy = useRef()

  const db = Firestore.getFirestore(app)

  const messagesRef = Firestore.collection(db, 'messages')
  const order = Firestore.orderBy('createdAt', 'asc')
  const limit = Firestore.limit(25)
  // const where = Firestore.where('uid', '==', auth.currentUser.uid)

  const query = Firestore.query(messagesRef, order, limit)


  const [messages] = useCollectionData(query, {idField: 'id'})
  console.log(messages)

  // const grabData = async(e) => {
  //   Firestore.getDoc(messagesRef)
  //   await Firestore.deleteDoc(getDoc())
  // }
  
  const [formValue, setFormValue] = useState('')

  // Send message when form submit button is clicked
  const sendMessage = async(e) => {
    e.preventDefault();

    if (formValue.trim() == '')
      return

    const { uid, photoURL } = auth.currentUser;

    await Firestore.addDoc(messagesRef, {
      text: formValue,
      createdAt: Firestore.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')
    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }
  
  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.createdAt} elementId ={`${msg.createdAt}`} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type='submit'>Send</button>
      </form>
    </>
  )
}

// Chat message component
function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;
  // console.log('ayy')

  const messageClass = (uid === auth.currentUser.uid) ? 'sent' : 'received';

  const photoSrc = photoURL ? photoURL : 'https://i.imgur.com/b4qpoP2.png'

  // Toggle between Popups on connect
  const togglePopup = () => {
    const popup = document.getElementById(props.elementId);
    popup.classList.toggle("show");
    popup.classList.toggle("popuptext")
  }

  return (
    <div className={`message ${messageClass}`}>
      <Popup elementId={props.elementId} message = {props.message}/>
      <img src={photoSrc} alt=''/>
      <p onClick={togglePopup}>{text}</p>
    </div>
  )
}

export default App;
