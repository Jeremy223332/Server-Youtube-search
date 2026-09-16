const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

let currentSong = {
    title: "No song selected",
    url: "",
    videoId: ""
};

// Search endpoint: call this from your web search dashboard
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query parameter 'q' required" });

    try {
        const ytRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                maxResults: 1,
                q: query,
                type: 'video',
                key: YOUTUBE_API_KEY
            }
        });

        const items = ytRes.data.items;
        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No videos found" });
        }

        const video = items[0];
        currentSong = {
            title: video.snippet.title,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            videoId: video.id.videoId
        };

        console.log(`[Queue Updated]: ${currentSong.title} (${currentSong.url})`);
        return res.json(currentSong);
    } catch (err) {
        console.error("YouTube Search Error:", err.response ? err.response.data : err.message);
        return res.status(500).json({ error: "Failed to search YouTube API" });
    }
});

// Endpoint for VRChat or web client to check currently queued song URL
app.get('/api/current-song', (req, res) => {
    res.json(currentSong);
});

app.listen(PORT, () => {
    console.log(`YouTube search server listening on port ${PORT}`);
});
