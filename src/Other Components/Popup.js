import React from "react";
import "./Popup.css";

import { firestore } from '../Firebase';
import { deleteDoc, doc} from "firebase/firestore";

function Popup(props) {
    const { id } = props.message;
    const message = props.message.data();
    const makeEdits = props.makeEdits;

    // Delete message from database when x is clicked
    const deleteMessage = async() => {
        await deleteDoc(doc(firestore, 'messages', id));
    }

    // Update message in database
    const editMessage = () => {
        const popup = document.getElementById(id);
        popup.classList.toggle("show");
        makeEdits(id, message);
    }

    return (
        <div className="popuptext" id={id}>
            <div className='edit-button' onClick={editMessage}>Edit</div>
            <div className='close-button' onClick={deleteMessage}>X</div>
        </div>
    )
}

export default Popup;