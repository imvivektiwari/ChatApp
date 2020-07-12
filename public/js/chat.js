const socket = io();
const currentUser = decodeURI(window.location.search).split("&")[0].split("=")[1].toLocaleLowerCase();

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $clearChat = document.querySelector('#clear-chat')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const fileMessageTemplate = document.querySelector('#file-message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    if (message.username === "Admin") {
        return;
    }
    let html;
    if (currentUser === message.username) {
        html = Mustache.render(messageTemplate, {
            username: "you",
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a'),
            right: " align-right"
        });
    }
    else {
        html = Mustache.render(messageTemplate, {
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a'),
            right: ""
        });
    }
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    users.reverse();
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
});

socket.on('file', (message) => {
    if (currentUser === message.username) {
        html = Mustache.render(fileMessageTemplate, {
            username: "you",
            url: `./download/?id=${message.url}`,
            name: message.url.substring(message.url.lastIndexOf('\\') + 1),
            createdAt: moment(message.createdAt).format('h:mm a'),
            right: " align-right"
        });
    }
    else {
        html = Mustache.render(fileMessageTemplate, {
            username: message.username,
            url: `./download/?id=${message.url}`,
            name: message.url.substring(message.url.lastIndexOf('\\') + 1),
            createdAt: moment(message.createdAt).format('h:mm a'),
            right: ""
        });
    }
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    });
});

$clearChat.addEventListener('click', () => {
    let message = document.querySelector("#messages");
    message.innerHTML = "";
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
});

const getFile = (input) => {
    let selectedFile = input.files[0];
    let formData = new FormData();
    console.log(JSON.stringify({ username, room }));
    formData.append("user", JSON.stringify({ username, room }));
    formData.append("file", selectedFile);

    let ajax = new XMLHttpRequest();
    ajax.open("POST", '/files');
    ajax.send(formData);
};