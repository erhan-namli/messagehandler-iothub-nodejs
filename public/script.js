$(document).ready(() => {

    // if deployed to a site supporting SSL, use wss://
    const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
    const webSocket = new WebSocket(protocol + location.host);

    webSocket.onmessage = function onMessage(message) {

        messageData = JSON.parse(message.data);

        RaspberryPiData = messageData.IotData

        document.getElementById("iotdata").innerHTML = RaspberryPiData

        console.log(RaspberryPiData);
        
    }

})
