import React, { useRef, useState } from 'react';
import './App.css';

import { auth, firestore } from './Firebase.js'

import * as Firestore from 'firebase/firestore'
import * as FirebaseAuth from 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import Popup from './Other Components/Popup';

const appName = 'FireLink'

/* Note to self: A QuerySnapshot is returned from a data request, 
*  either by calling the getDocs() or useCollectionData().3 methods.
*  It contains an array of the documents from your request. Use the  
*  then can call one of the class methmethod on it with a callback
*  to access the individual document itself
*/
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

  const messagesRef = Firestore.collection(firestore, 'messages')
  const order = Firestore.orderBy('createdAt', 'asc')
  const limit = Firestore.limit(25)

  const query = Firestore.query(messagesRef, order, limit)

  // [values, loading, error, snapshot]
  const snapshot = useCollectionData(query, {idField: 'id'})[3]

  const [formValue, setFormValue] = useState('')

  // Add message to database when form submit button is clicked
  const sendMessage = async(e) => {
    e.preventDefault();

    if (formValue.trim() === '')
      return;

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
      <main className='main-padding'>
        {snapshot && snapshot.docs.map(msg => <ChatMessage key={msg.id} message={msg} />)}

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
  const { text, uid, photoURL } = props.message.data();
  const { id } = props.message;

  const messageClass = (uid === auth.currentUser.uid) ? 'sent' : 'received';

  const photoSrc = photoURL ? photoURL : 'https://i.imgur.com/b4qpoP2.png';

  // Toggle between Popups on connect
  const togglePopup = () => {
    if (uid !== auth.currentUser.uid)
      return

    const popup = document.getElementById(id);
    popup.classList.toggle("show");
    popup.classList.toggle("popuptext");
  }

  return (
    <div className={`message ${messageClass}`}>
      {<Popup message = {props.message}/>}
      <img src={photoSrc} alt=''/>
      <p onClick={togglePopup}>{text}</p>
    </div>
  )
}

export default App;