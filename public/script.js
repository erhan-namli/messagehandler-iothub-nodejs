$(document).ready(() => {

    // if deployed to a site supporting SSL, use wss://
    const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
    const webSocket = new WebSocket(protocol + location.host);

    webSocket.onmessage = function onMessage(message) {

        messageData = JSON.parse(message.data);

        RaspberryPiData = messageData.IotData

        document.getElementById("iotdata").innerHTML = RaspberryPiData

    }
})

window.onload = function () {


    sendMessageButton = document.querySelector('#sendMessageButton')

    sendMessageButton.addEventListener('click', function() {

    // When you press the send button this peace of code working and sending message to the server side
        webSocketSendMessagetoServer()

    })
}

var webSocketSendMessagetoServer = function () {

    const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
    const webSocket2 = new WebSocket(protocol + location.host)

    messageInput = document.querySelector('#messageInput')

    data = JSON.stringify( {
        method : 'sendMessage',
        messageContent : messageInput.value
    })

    webSocket2.onopen = function () {

        webSocket2.send(data)

    }
}
