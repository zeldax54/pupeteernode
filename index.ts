import express,{Request,Response} from "express";
import { Socket } from "socket.io";
import { RemoteAuth } from "whatsapp-web.js";
import { MongoStore } from "wwebjs-mongo";
import { HttpClient } from "./httpclient";



const app = express()
let dotenv = require('dotenv').config()
console.log(dotenv);
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const qrCode = require('qrcode');
const { Client } = require('whatsapp-web.js');

app.use(cors(
  {
   origin:process.env.ADMINAPPURL
  }
  ));
app.use(bodyParser.json())
const server = require('http').createServer(app);
const io = require('socket.io')(server,{ cors: {origin:process.env.ADMINAPPURL}});

const port = process.env.PORT

app.post('/configure', (req:Request, res:Response) => {  

  mongoose.connect(process.env.MONGOURL).then(() => {
    
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 60000,
            clientId:req.body.number
        })
    });

  const opts = {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.3,
      margin: 1   
     };

  client.on('qr', (qr:any) => { 
      console.log('Qr is ready',qr);   
  
      qrCode.toDataURL(qr, opts, function (err:any, url:any) {
        if (err) throw err          
        io.emit('RegistrationQr', url);
      })     
  });  

  client.on('ready', () => {
    io.emit('AuthReady', 'Session ready!');
      console.log('Client is ready!');   
  });  
  
  client.on('authenticated', async (session:any) => {   
    console.log('Authenticated!');    
  });

  client.on('remote_session_saved', async () => {
    console.log('Session Ready!');    
    const token = req.header('Authorization');
    const xIdentifier = req.header('X-Nameidentifier');
    const httpClient = new HttpClient();
    await httpClient.addUpdateNumber(req.body.number,req.body.forcontainer,token!,xIdentifier!);

    io.emit('RegistrationEndTest', 'Session ready!');
    res.send("Session ready!");
  });
 

    client.initialize();
  });

});

app.get('/checkHealth',(req:Request, res:Response)=>{
  

});



server.listen(port, () => {
  console.log(`App listening on port ${port}`)
});

io.on('connection',(socket:Socket)=>{
  console.log(`socket ${socket.id} connected`);

  // upon disconnection
  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
  });
});