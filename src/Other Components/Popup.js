import React from "react";
import "./Popup.css"

import { app, auth } from '../Firebase'
import { collection,  getDoc,  getDocs, getFirestore, limit, query, where} from "firebase/firestore";
import { deleteDoc, doc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";

function Popup(props) {
    const firestore = getFirestore(app)

    const deleteMessage = async() => {
        const popup = document.getElementById(props.elementId);
        popup.classList.toggle("show");
        popup.classList.toggle("popuptext")

        const messagesRef = collection(firestore, 'messages')
        const whereQ = where('createdAt', '==', props.message.createdAt)
        const limitQ = limit(1)
        const queryQ = query(messagesRef, whereQ, limit)
        
        // console.log('Deleted Message')
        let docs = await getDocs(queryQ)
        docs.forEach((document) => {
            // deleteDoc(doc(firestore, ) document.get())
            console.log(document.data())
        })
    }

    return (
        <span className="popuptext" id={props.elementId}>
            <div className='closePopup' onClick={deleteMessage}>X</div>
        </span>
    )
}

export default Popup;