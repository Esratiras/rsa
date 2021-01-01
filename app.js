const request = require('request');
const cheerio = require('cheerio');
const bodyParser = require('body-parser')
const path = require('path')
const port = 3010
const hostname = '127.0.0.1'
const  fs = require('fs');
const express = require("express");
const app = express()
const http = require('http').Server(app)
const rsaWrapper = require('./components/rsa-wrapper');

app.use(express.static('public'))
const io = require('socket.io')(http)

let router = express.Router()


io.on('connection',(socket) =>{
    console.log(`User Connected - Socket Id: ${socket.id}`)
    let encrypted = rsaWrapper.encrypt(rsaWrapper.clientPub, 'Hello RSA message from client to server');
    socket.emit('rsa server encrypted message', encrypted);

    let currentRoom = null

    socket.on('JOIN',(roomName) =>{

        let room = io.sockets.adapter.rooms[roomName] //process a room join request

        if(room && room.length > 1){
            io.to(socket.id).emit('ROOM_FULL',null)

        socket.broadcast.to(roomName).emit('INSTRUSION_ATTEMPT',null)
        }
        else{
            socket.leave(currentRoom)

            socket.broadcast.to(currentRoom).emit('USER_DISCONNECTED',null)

            currentRoom = roomName
            socket.join(currentRoom)

            io.to(socket.id).emit('ROOM_JOINED',currentRoom)

            socket.broadcast.to(currentRoom).emit('NEW_CONNECTION',null)
        }

            })
              socket.on('MESSAGE',(msg)=>{
                  console.log(`New message - ${msg.text}`)
                  socket.broadcast.to(currentRoom).emit('MESSAGE',msg)
              })

            socket.on('PUBLIC_KEY',(key) =>{
                socket.broadcast.to(currentRoom).emit('PUBLIC_KEY',key)
            })

            socket.on('disconnect',()=>{
                socket.broadcast.to(currentRoom).emit('USER_DISCONNECTED',null)
            })

        })



    app.get('/',  (req,res) =>{
        res.sendFile(path.resolve(__dirname,'public/index.html'))
    })



    app.listen(port,hostname, () => {
        console.log(`Server Çalışıyor,http://${hostname}:${port}/`)
    })

module.exports = router