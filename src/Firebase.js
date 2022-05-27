import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize app & get auth
export const app = initializeApp({
    apiKey: "AIzaSyBtmgEtMCtWxKG4KJfpua08v8Xd82zp3KY",
    authDomain: "nitechat-4aef3.firebaseapp.com",
    projectId: "nitechat-4aef3",
    storageBucket: "nitechat-4aef3.appspot.com",
    messagingSenderId: "884212553000",
    appId: "1:884212553000:web:dd2d3d73738552bdcaec1d"
});
  
export const auth = getAuth(app);

export const firestore = getFirestore(app);