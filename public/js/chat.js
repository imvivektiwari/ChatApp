const socket = io();
var video = document.getElementById('video-chat');
// When the client receives a voice message it will play the sound
socket.on('voice', function (arrayBuffer) {
    var blob = new Blob([arrayBuffer], { mimeType: 'video/mp4; codecs="opus,vp8"' });
    video.src = window.URL.createObjectURL(blob);
    video.play();
});

socket.on("giveMessage", data => {
    console.log(data);
    let $chatContainer = document.getElementById("chat-container");

    let p = document.createElement("p");
    p.innerText = data;
    $chatContainer.prepend(p);

});

const send = () => {
    let $msg = document.getElementById("chat-input");
    if (msg.value) {
        socket.emit("getMessage", msg);
        $msg.value = "";
    }
}

const f2f = () => {
    let chunks = [];
    navigator.mediaDevices.getUserMedia({ video:true, audio: true }).then(mediaStream => {

        var mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorder.onstart = function (e) {
            this.chunks = [];
        };
        mediaRecorder.ondataavailable = function (e) {
            this.chunks.push(e.data);
            sendVoice(this.chunks)
        };
        mediaRecorder.onstop = function (e) {
            //setTimeout(()=>{sendVoice(this.chunks)}, 1000);
        };

        // Start recording
        mediaRecorder.start();
        // Stop recording after 5 seconds and broadcast it to server
        setInterval(function () {
            mediaRecorder.stop()
            mediaRecorder.start()
        }, 1500);
    });

};
f2f();

const sendVoice = (chunks) => {
    var blob = new Blob(chunks, { mimeType: 'video/mp4; codecs="opus,vp8"' });
    socket.emit('radio', blob);
};