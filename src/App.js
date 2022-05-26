import React, { useRef, useState } from 'react';
import './App.css';

import * as Firebase from 'firebase/app'
import * as Firestore from 'firebase/firestore'
import * as FirebaseAuth from 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Initialize app & get auth
const app = Firebase.initializeApp({
  apiKey: "AIzaSyBNw4baFbf65jFVckENHmZ_plmpLnzoHr0",
  authDomain: "firechat-7dae0.firebaseapp.com",
  projectId: "firechat-7dae0",
  storageBucket: "firechat-7dae0.appspot.com",
  messagingSenderId: "607525743098",
  appId: "1:607525743098:web:cdb32ebea006a38f7adc43"
});

const auth = FirebaseAuth.getAuth(app)

// React app component
function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      {/* <header className="App-header"></header> */}

      <section>
        {user ? <ChatRoom /> : <SignIn />}
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
      <SignOut />
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
