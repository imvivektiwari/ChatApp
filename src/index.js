const path = require('path');
const http = require('http');
const express = require('express');
const socket = require("socket.io");
const ngrok = require('ngrok');
const port = process.env.PORT || 3000;

(async function () {
    const url = await ngrok.connect(port);
    console.log(url);
})();

const app = express();
const server = http.createServer(app);
const io = socket(server);


const publickDir = path.join(__dirname, "../public");
app.use(express.static(publickDir));


io.on('connection', (socket) => {
    socket.on("getMessage", data => {
        io.emit("giveMessage", data);
    });
    socket.on('radio', function(blob) {
        socket.broadcast.emit('voice', blob);
    });
});

server.listen(port, () => { console.log(`server started: ${port}`) });