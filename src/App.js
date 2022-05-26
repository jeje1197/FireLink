import React, { useRef, useState } from 'react';
import './App.css';

import * as Firebase from 'firebase/app'
import * as Firestore from 'firebase/firestore'
import * as FirebaseAuth from 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Initialize app & get auth
const app = Firebase.initializeApp({
  apiKey: "AIzaSyBtmgEtMCtWxKG4KJfpua08v8Xd82zp3KY",
  authDomain: "nitechat-4aef3.firebaseapp.com",
  projectId: "nitechat-4aef3",
  storageBucket: "nitechat-4aef3.appspot.com",
  messagingSenderId: "884212553000",
  appId: "1:884212553000:web:dd2d3d73738552bdcaec1d"
});

const auth = FirebaseAuth.getAuth(app)

// React app component
function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">{!user ? <SignIn/> : <SignOut/>}</header>

      <section>
        {user && <ChatRoom/>}
      </section>
    </div>
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

  const firestore = Firestore.getFirestore(app)

  const messagesRef = Firestore.collection(firestore, 'messages')
  const order = Firestore.orderBy('createdAt', 'asc')
  const limit = Firestore.limit(25)

  const query = Firestore.query(messagesRef, order, limit)

  const [messages] = useCollectionData(query, {idField: 'id'})

  const [formValue, setFormValue] = useState('')

  // Send message when form submit button is clicked
  const sendMessage = async(e) => {
    e.preventDefault();

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
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

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

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt=''/>
      <p>{text}</p>
    </div>
  )
}

export default App;
