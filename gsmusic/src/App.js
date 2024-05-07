import React, { useState, useEffect } from "react";
import "./App.css";
import Musicplayer from "./Musicplayer.js";
import Loader from "./Loader.js"; 
import audioClip from "./loader.mp3"; 

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = new Audio(audioClip);
    let audioPlayed = false;

    const playAudio = () => {
      if (audio && audio.paused) {
        audio.play();
        audioPlayed = true;
      }
    };

    const interactionHandler = () => {
      if (!audioPlayed) {
        playAudio();
        setIsLoading(false);
        document.removeEventListener("click", interactionHandler);
        document.removeEventListener("keydown", interactionHandler);
      }
    };

    const timeout = setTimeout(() => {
      setIsLoading(false);
      document.addEventListener("click", interactionHandler);
      document.addEventListener("keydown", interactionHandler);
    }, 10000);

    return () => {
      clearTimeout(timeout);
      audio.pause();
    };
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : (
        <Musicplayer />
      )}
    </>
  );
}

export default App;
