import React, { useRef, useState } from 'react';
import './App.css';

import { auth, firestore } from './Firebase.js';

import * as Firestore from 'firebase/firestore';
import * as FirebaseAuth from 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import Popup from './Other Components/Popup';
import { HHMM_AMPM } from './Helpers/DateFormatter';

const appName = 'FireLink';

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
      <div className='App-welcome'>Welcome to {appName}!</div>
      <br/>
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
    <button onClick={signInWithGoogle}>Sign in</button>
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
  const dummy = useRef();

  const messagesRef = Firestore.collection(firestore, 'messages');
  const order = Firestore.orderBy('createdAt', 'asc');
  const limit = Firestore.limit(25);

  const query = Firestore.query(messagesRef, order, limit);

  // [values, loading, error, snapshot]
  const snapshot = useCollectionData(query, {idField: 'id'})[3];

  const [formValue, setFormValue] = useState('');
  const [userEdit, setUserEdit] = useState([false, "id", "message object"]);

  const makeEdits = (id, selectedMessage) => {
    // If already editing, stop editing
    if (userEdit[0]) {
      setFormValue('');
      setUserEdit([false, null, null]);
      return;
    }

    setFormValue(selectedMessage.text);
    setUserEdit([true, id, selectedMessage]);
  }

  const sendEditedMessage = (text) => {
    const id = userEdit[1];
    const message = userEdit[2];
    const { createdAt, uid, photoURL } = message;

    Firestore.setDoc(Firestore.doc(firestore, 'messages', id), {
      text,
      editedAt: Firestore.serverTimestamp(),
      createdAt,
      uid,
      photoURL
    })
  }

  const sendRegularMessage = async(text) => {
    const { uid, displayName, photoURL } = auth.currentUser;

    await Firestore.addDoc(messagesRef, {
      text,
      createdAt: Firestore.serverTimestamp(),
      uid,
      name: displayName,
      photoURL
    })
  }
    
  // Add message to database when form submit button is clicked
  const sendMessage = async(e) => {
    e.preventDefault();
    const isEditing = userEdit[0];

    if (formValue.trim() === '') {
      alert("You cannot send an empty message.")
      return;
    }

    if (isEditing) {
      sendEditedMessage(formValue);
    } else {
      sendRegularMessage(formValue);
    }

    setUserEdit([false, null, null])
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }
  
  return(
    <>
      <main className='main-padding'>
        {snapshot && snapshot.docs.map(msg => 
          <ChatMessage key={msg.id} message={msg} makeEdits={makeEdits}/>)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        { (userEdit[0]) ? "Editing:" : ""}
        <input value={formValue} onChange={ (e) => {setFormValue(e.target.value)}}
        />

        <button type='submit'>Send</button>
      </form>
    </>
  )
}

// Chat message component
function ChatMessage(props) {
  const { text, createdAt, uid, photoURL, editedAt } = props.message.data();
  const { id } = props.message;
  const makeEdits = props.makeEdits;

  let displayTime = HHMM_AMPM(createdAt);
  if (editedAt) displayTime = HHMM_AMPM(editedAt) + '(edited)';

  const messageClass = (uid === auth.currentUser.uid) ? 'sent' : 'received';

  const photoSrc = photoURL ? photoURL : 'https://i.imgur.com/b4qpoP2.png';

  // Toggle between Popups on connect
  const togglePopup = () => {
    if (uid !== auth.currentUser.uid)
      return;

    const popup = document.getElementById(id);
    popup.classList.toggle("show");
  }
  
  return (
      <div className={`message ${messageClass}`}>
        <Popup message = {props.message} makeEdits = {makeEdits}/>
        <img src={photoSrc} alt=''/>
        <p onClick={togglePopup}>{text}</p>
        <div className='message-time'>{displayTime}</div>
      </div>
  )
}

export default App;