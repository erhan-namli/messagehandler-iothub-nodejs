const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const bodyParser = require('body-parser')
const app = express();
const EventHubReader = require('./scripts/event-hub-reader.js');

var sCONNECTION_STRING = ""
var sDEVICE_ID = ""
var sSERVICE_KEY = ""
var sCONSUMER_GROUP = ""

app.use(express.static(path.join(__dirname, 'public')));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

let server = http.createServer(app);

let wss = new WebSocket.Server({ server });


wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        console.log(`Broadcasting data ${data}`);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

app.post('/action_page', (req, res) => {

    sCONNECTION_STRING = req.body.connection_string
    
    sDEVICE_ID = req.body.device_id

    sSERVICE_KEY = req.body.service_key

    sCONSUMER_GROUP = req.body.consumer_group

    res.redirect('/home');

})

app.get("/home", (req, res) => {

    const eventHubReader = new EventHubReader(sSERVICE_KEY, sCONSUMER_GROUP);

    (async () => {
        await eventHubReader.startReadMessage((message, date) => {
          try {
            const payload = {
              Type : message.type,
              IotData: message.data,
              MessageDate: date || Date.now().toISOString(),
            };

            console.log(payload)
      
            wss.broadcast(JSON.stringify(payload));
          } catch (err) {
            console.error('Error broadcasting: [%s] from [%s].', err, message);
          }
        });
      })().catch();

    res.sendFile(path.join(__dirname, 'public/home.html'));
    
})

wss.on('connection', ws => {
  ws.on('message', message => {

    console.log("Client Message : " + message)

    if ( JSON.parse(message).method == 'sendMessage') {

      var messageContent = JSON.parse(message).messageContent 

      var Client = require('azure-iothub').Client;
      var Message = require('azure-iot-common').Message;

      var ServiceClient = Client.fromConnectionString(sSERVICE_KEY)

      ServiceClient.open(function (err) {
        if (err) {
          console.error('Could not connect: ' + err.message);
        } else {
          console.log('Service client connected');
        
          var message = new Message("Data" + "," + messageContent)
          //console.log('Sending message: ' + message.getData());

          console.log(sDEVICE_ID);

          ServiceClient.send(sDEVICE_ID, message);
          console.log("Buraya geldi")
        }
      });

    }
    

  })})



server.listen(process.env.PORT || '3030', () => {
    console.log('Listening on %d.', server.address().port);
  });

