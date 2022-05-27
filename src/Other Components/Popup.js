import React from "react";
import "./Popup.css"

import { firestore } from '../Firebase'
import { deleteDoc, doc } from "firebase/firestore";

function Popup(props) {
    const { id } = props.message

    // Delete message from database when x is clicked
    const deleteMessage = async() => {
        await deleteDoc(doc(firestore, 'messages', id))
    }

    return (
        <span className="popuptext" id={id}>
            <div className='closePopup' onClick={deleteMessage}>X</div>
        </span>
    )
}

export default Popup;