const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

const app = express();
app.use(express.static('public'));
app.use(express.json());

ffmpeg.setFfmpegPath(ffmpegPath);

app.post('/download', async (req, res) => {
  const { url, type, quality } = req.body;

  if (!ytdl.validateURL(url)) return res.status(400).send('Invalid URL');

  const info = await ytdl.getInfo(url);
  const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_');

  res.header('Content-Disposition', `attachment; filename="${title}.${type}"`);

  const stream = ytdl(url, { quality: 'highest' });

  if (type === 'mp3') {
    ffmpeg(stream)
      .audioBitrate(quality || 128)
      .format('mp3')
      .pipe(res);
  } else {
    ytdl(url, {
      quality: quality || 'highestvideo',
      filter: format => format.container === 'mp4',
    }).pipe(res);
  }
});

app.listen(3000, () => {
  console.log('サーバー起動中: http://localhost:3000');
});
