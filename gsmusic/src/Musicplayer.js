import React, { useState, useRef, useEffect } from "react";
import "./Musicplayer.css";
import PopupMessage from "./PopupMessage";

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSongImage, setCurrentSongImage] = useState("");
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [volume, setVolume] = useState(0.5);
  const [showPopup, setShowPopup] = useState(true);
  const [showPopupMessage, setShowPopupMessage] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Function to handle closing the popup
  const handleOk = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" || event.key === "Escape") {
        handleOk();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Fetch The api backend
  useEffect(() => {
    fetch("/api/songs/")
      .then((response) => {
        if (!response.ok) {
          // throw new Error("Failed to fetch songs");
          throw new alert("Failed to fetch songs");
        }
        return response.json();
      })
      .then((data) => {
        setSongs(data);
        if (data.length > 0) {
          const storedIndex = localStorage.getItem("currentSongIndex");
          setCurrentSongImage(`${data[storedIndex].image}`);
          audioRef.current.src = `${data[storedIndex].audio}`;
        }
      })
      .catch((error) => console.error("Error fetching songs:", error));
  }, [currentSongIndex]);

  // Loacl storage Save the index value
  useEffect(() => {
    const storedIndex = localStorage.getItem("currentSongIndex");
    if (storedIndex !== null) {
      setCurrentSongIndex(parseInt(storedIndex));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("currentSongIndex", String(currentSongIndex));
  }, [currentSongIndex]);

  // Function to handle playing the current song
  const handlePlay = () => {
    setIsImageLoaded(false);
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Playback failed:", error);
        });
    }
  };

  // Function to play the next song
  const handleNext = () => {
    const newIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(newIndex);

    setCurrentSongImage(songs[newIndex]?.image || "");
    audioRef.current.src = songs[newIndex]?.audio || "";
    audioRef.current.addEventListener("loadeddata", () => {
      handlePlay();
    });

    if (audioRef.current.readyState >= 2) {
      handlePlay();
    }
  };

  // Function to play the previous song
  const handlePrevious = () => {
    const newIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(newIndex);
    setCurrentSongImage(`${songs[newIndex].image}`);
    audioRef.current.src = `${songs[newIndex].audio}`;
    audioRef.current.addEventListener("loadeddata", () => {
      handlePlay();
    });
    if (audioRef.current.readyState >= 2) {
      handlePlay();
    }
  };

  // Function to handle play/pause toggle
  const playPauseToggle = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      handlePlay();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onloadeddata = () => {};
      audioRef.current.onplay = () => {
        setIsPlaying(true);
      };
      audioRef.current.onpause = () => {
        setIsPlaying(false);
      };
      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current.currentTime);
      };
      audioRef.current.onended = handleNext;
    }
  });

  // Function to handle progress change
  const handleProgressChange = (e) => {
    audioRef.current.currentTime = (e.target.value * duration) / 100;
  };

  // Showing the list of songs
  function setVal() {
    const valbtn = document.querySelector(".volumerange");
    valbtn.classList.toggle("showlist");
    setTimeout(() => {
      valbtn.classList.remove("showlist");
    }, 5000);
  }

  function setSearchdiv() {
    const Searchbtn = document.querySelector(".song_filter");
    Searchbtn.classList.add("showlist1");
  }
  function closediv() {
    const Searchbtn = document.querySelector(".song_filter");
    Searchbtn.classList.remove("showlist1");
  }

  // Volume Function
  const fwa = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Filter songs based on search query and selected category
  const filteredSongs = songs.filter((song) => {
    const matchesSearch = song.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || song.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleSongClick = (index) => {
    const Searchbtn = document.querySelector(".song_filter");
    Searchbtn.classList.remove("showlist1");
    setCurrentSongIndex(index);
    setCurrentSongImage(songs[index].image);
    audioRef.current.src = songs[index].audio;
    audioRef.current.onloadeddata = () => {
      handlePlay();
      setIsImageLoaded(false);
    };
  };

  useEffect(() => {
    if (songs.length > 0) {
      const titleWords = songs[currentSongIndex].title.split(" ");
      const shortenedTitle = titleWords.slice(0, 3).join(" ");
      const remainingTitle = titleWords.slice(3).join(" ");
      const titleElement = document.getElementById("title");
      titleElement.innerHTML = shortenedTitle;
      setTimeout(() => {
        titleElement.innerHTML = `${shortenedTitle} ${remainingTitle}`;
      }, 2000);
      titleElement.classList.remove("scrolling-title");
      void titleElement.offsetWidth;
      titleElement.classList.add("scrolling-title");
    }
  }, [currentSongIndex, songs]);
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    } else {
      return text.substring(0, maxLength) + "...";
    }
  };

  // Function to handle image load
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };
  const imageLoader =
    !isImageLoaded && !isPlaying ? (
      <div className="image-loader">
        <div className="load"></div>
      </div>
    ) : null;
  return (
    <div className="music-container">
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>
              Welcome to GS Music, Please use Headphone{" "}
              <i class="fa fa-headphones"></i>
            </h3>

            <button className="ok-btn" onClick={handleOk}>
              OK
            </button>
          </div>
        </div>
      )}
      <div className="music-body">
        <div className="theme_changer">
          <i class="fa fa-gear fa-spin"></i>
        </div>
        <div className="layer">
          <div className="volume-slider">
            <span className="bar"></span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={fwa}
              className="volumerange"
            />
          </div>
        </div>
        <div className="top-icons">
          <button className="volume btn" onClick={() => setVal()}>
            <i id="volumeicon" className="fas fa-volume-up"></i>
          </button>
          <div className="title_name">
            <h4>G S Music</h4>
          </div>

          <button className="list btn" onClick={() => setSearchdiv()}>
            <i className="fas fa-list"></i>
          </button>
        </div>
        <div className="music-img">
          {imageLoader}
          <img
            src={currentSongImage}
            alt="song-images"
            id="img"
            onLoad={handleImageLoad}
          />
        </div>

        <div className="music-info">
          <h2 id="title" className="scrolling-title">
            {songs.length > 0 ? songs[currentSongIndex].title : "No Title"}
          </h2>
          <span id="artist">
            {songs.length > 0 ? songs[currentSongIndex].artist : "No artist"}
          </span>
        </div>

        <audio
          id="audio"
          ref={audioRef}
          onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
          onDurationChange={() => setDuration(audioRef.current.duration)}
        ></audio>
        <div className="music-progress">
          <div className="progress-bar">
            <span
              className="progress-line"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></span>
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100}
              className="progress"
              onChange={handleProgressChange}
            />
          </div>
          <div className="duration">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="duration-time">{formatTime(duration)}</span>
          </div>
        </div>
        <div className="music-controls">
          <button className="repeat btn">
            <i className="fas fa-redo-alt"></i>
          </button>
          <div className="main-controls">
            <button className="prevbtn" onClick={handlePrevious}>
              <i className="fas fa-backward"></i>
            </button>
            <button className="playpause" onClick={playPauseToggle}>
              <i
                id="playpause-btn"
                className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`}
              ></i>
            </button>
            <button className="nextbtn" onClick={handleNext}>
              <i className="fas fa-forward"></i>
            </button>
          </div>
          <button className="like btn">
            <i id="likeicon" className="far fa-heart"></i>
          </button>
        </div>
        <div className="songs-list">
          <button className="list-close btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div className="song_filter">
        {showPopupMessage && (
          <PopupMessage
            message="Warning: Bhajpuri songs may not be suitable for all audiences."
            onClose={() => setShowPopupMessage(false)}
          />
        )}
        <div className="close" onClick={() => closediv()}>
          <i className="fas fa-times"></i>
        </div>
        <input
          type="text"
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => {
            if (e.target.value === "Bhajpuri") {
              setShowPopupMessage(true);
            } else {
              setSelectedCategory(e.target.value);
            }
          }}
        >
          <option value="All">All Categories</option>
          <option value="Hindi">Hindi</option>
          <option value="English">English</option>
          <option value="Punjabi">Punjabi</option>
          <option value="Bhajpuri">Bhajpuri</option>
          <option value="Jhumar">Jhumar</option>
          <option value="Odia">Odia</option>
        </select>

        {filteredSongs.map((song, index) => (
          <div
            className="search_box"
            key={song.id}
            onClick={() => handleSongClick(index)}
          >
            <h5 className="scroll-text">{truncateText(song.title, 30)}</h5>
            <h5 className="scroll-text">{truncateText(song.artist, 10)}</h5>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

export default MusicPlayer;
