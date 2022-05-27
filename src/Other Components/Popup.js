import React from "react";
import "./Popup.css"

import { firestore } from '../Firebase'
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";

function Popup(props) {
    const { id } = props.message

    // Delete message from database when x is clicked
    const deleteMessage = async() => {
        await deleteDoc(doc(firestore, 'messages', id))
    }

    // Edit message in database
    const editMessage = async() => {
        await setDoc(doc(firestore, 'messages', id), {
            text: 'Edited Text',
            edited: serverTimestamp()
        })
    }

    return (
        <span className="popuptext" id={id}>
            <div className='editButton' onClick={editMessage}>Edit</div>
            <div className='closePopup' onClick={deleteMessage}>X</div>
        </span>
    )
}

export default Popup;