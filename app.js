const express = require('express');
const ytdl = require('ytdl-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/download', async (req, res) => {
  const videoUrl = req.body.videoUrl;

  try {
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    const mp3Path = path.join(__dirname, `${title}.mp3`);

    const video = ytdl(videoUrl, { quality: 'highestaudio' });

    // Convert video stream to MP3 format
    ffmpeg(video)
      .audioBitrate(128)
      .save(mp3Path)
      .on('end', () => {
        console.log('Conversion complete!');
        res.download(mp3Path, `${title}.mp3`, (err) => {
          if (err) {
            console.error('Error:', err.message);
          }

          fs.unlink(mp3Path, (err) => {
            if (err) {
              console.error('Error:', err.message);
            }
          });
        });
      });
  } catch (error) {
    console.error('Error:', error.message);
    res.redirect('/');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
