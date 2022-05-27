import React from "react";
import "./Popup.css"

import { firestore } from '../Firebase'
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";

function Popup(props) {
    const { uid, createdAt, photoURL} = props.message.data()
    const { id } = props.message


    // Delete message from database when x is clicked
    const deleteMessage = async() => {
        await deleteDoc(doc(firestore, 'messages', id))
    }

    // Update message in database
    const editMessage = async() => {
        await setDoc(doc(firestore, 'messages', id), {
            text: 'Edited Message',
            editedAt: serverTimestamp(),
            createdAt,
            uid,
            photoURL
        })
        
        const popup = document.getElementById(id);
        popup.classList.toggle("show");
        popup.classList.toggle("popuptext");
    }

    return (
        <div className="popuptext" id={id}>
            <div className='edit-button' onClick={editMessage}>Edit</div>
            <div className='close-button' onClick={deleteMessage}>X</div>
        </div>
    )
}

export default Popup;