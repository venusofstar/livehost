const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = __dirname + '/users.json';
if(!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{}');
let users = JSON.parse(fs.readFileSync(USERS_FILE));

function generateStreamKey() {
    return Math.random().toString(36).substring(2,12);
}

// Register new user
app.post('/register', (req,res)=>{
    const {username} = req.body;
    if(!username) return res.status(400).send({error:'Username required'});
    if(users[username]) return res.status(400).send({error:'Username exists'});

    const key = generateStreamKey();
    users[username] = { streamKey: key };
    fs.writeFileSync(USERS_FILE, JSON.stringify(users,null,2));

    const rtmp = `rtmp://YOUR_DOMAIN/live/${key}`;
    const m3u8 = `http://YOUR_DOMAIN:8080/hls/${key}.m3u8`;

    res.send({username, streamKey: key, rtmp, m3u8});
});

// Validate RTMP for Nginx
app.post('/auth', (req,res)=>{
    const {stream} = req.body;
    const valid = Object.values(users).some(u=>u.streamKey===stream);
    if(valid) res.sendStatus(200);
    else res.sendStatus(403);
});

// Get M3U playlist of all users
app.get('/playlist.m3u', (req,res)=>{
    let m3u = "#EXTM3U\n";
    for(const [u,data] of Object.entries(users)){
        m3u += `#EXTINF:-1,${u} Live Stream\n`;
        m3u += `http://YOUR_DOMAIN:8080/hls/${data.streamKey}.m3u8\n`;
    }
    res.setHeader('Content-Type','audio/mpegurl');
    res.send(m3u);
});

app.listen(3000, ()=>console.log('Backend running on port 3000'));
