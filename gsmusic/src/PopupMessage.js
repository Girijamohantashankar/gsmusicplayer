import React from "react";
import "./PopupMessage.css";
import shortAudio from "./voice.mp3"; 

const PopupMessage = ({ message, onClose }) => {
  return (
    <div className="popup-message">
      <div className="popup-content">
        <p>{message}</p>
        {/* Audio element for short audio */}
        <audio autoPlay>
          <source src={shortAudio} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PopupMessage;
