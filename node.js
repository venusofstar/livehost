const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = __dirname + '/users.json';
let users = JSON.parse(fs.readFileSync(USERS_FILE));

// Generate random key
function generateKey() {
    return Math.random().toString(36).substring(2,12);
}

// Register user
app.post('/register', (req, res) => {
    const { username } = req.body;
    if(!username) return res.status(400).send({error:'Username required'});
    if(users[username]) return res.status(400).send({error:'Username exists'});

    const key = generateKey();
    users[username] = { streamKey: key };
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.send({username, streamKey: key});
});

// Validate RTMP key for Nginx
app.post('/auth', (req, res) => {
    const { name, app, tc_url, stream } = req.body;
    const valid = Object.values(users).some(u => u.streamKey === stream);

    if(valid) res.sendStatus(200);
    else res.sendStatus(403);
});

// List M3U links for all users
app.get('/playlist.m3u', (req, res) => {
    let m3u = "#EXTM3U\n";
    for(const [username, data] of Object.entries(users)){
        m3u += `#EXTINF:-1,${username} Live Stream\n`;
        m3u += `http://YOUR_DOMAIN:8080/hls/${data.streamKey}.m3u8\n`;
    }
    res.setHeader('Content-Type','audio/mpegurl');
    res.send(m3u);
});

app.listen(3000, () => console.log("Server running on port 3000"));
