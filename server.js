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
        await eventHubReader.startReadMessage((message, date, deviceId) => {
          try {
            const payload = {
              Type : message[0].type,
              IotData: message,
              MessageDate: date || Date.now().toISOString(),
              DeviceId: deviceId,
            };

            console.log(payload)
      
            wss.broadcast(JSON.stringify(payload));
          } catch (err) {
            console.error('Error broadcasting: [%s] from [%s].', err, message);
          }
        });
      })().catch();

    res.send("Selam")
    
})

let server = http.createServer(app);

server.listen(process.env.PORT || '3030', () => {
    console.log('Listening on %d.', server.address().port);
  });

