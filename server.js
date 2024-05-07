const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const upload = multer({ dest: 'uploads/' });
let songs = [];

app.use(cors());

try {
  const data = fs.readFileSync('songs.json', 'utf8');
  songs = JSON.parse(data);
} catch (err) {
  console.error('Error reading songs from file:', err);
}

// app.get('/api/songs', (req, res) => {
//   res.json(songs);
// });
app.get('/api/songs', (req, res) => {
  // Shuffle the songs array
  const shuffledSongs = shuffleArray(songs);
  res.json(shuffledSongs);
});
// Function to shuffle an array
const shuffleArray = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

app.post('/api/songs', upload.single('songFile'), (req, res) => {
  const { title, image, artist, categories } = req.body;
  const songFile = req.file;

  if (!title || !image || !artist || !categories || !songFile) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newId = songs.length > 0 ? songs[songs.length - 1].id + 1 : 1;
  const fileName = `${newId}_${songFile.originalname}`;
  const filePath = path.join(__dirname, 'songs', fileName);
  fs.renameSync(songFile.path, filePath);

  const newSong = {
    id: newId,
    title,
    image,
    artist,
    categories: categories.split(',').map(category => category.trim()), 
    audio: `/audio/${fileName}`,
  };

  songs.push(newSong);
  saveSongsToFile(); 
  res.status(201).json(newSong);
});


app.use('/uploads_Songs', express.static('uploads_Songs'));



// Save songs to JSON file
const saveSongsToFile = () => {
  fs.writeFileSync('songs.json', JSON.stringify(songs, null, 2), 'utf8');
};


// Serve static files
app.use(express.static(path.join(__dirname, "./gsmusic/build")));

// Handle routes for SPA
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./gsmusic/build/index.html"), (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send(err);
        }
    });
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
