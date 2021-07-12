const path=require('path')
const http = require('http')
const express = require('express')
const socketio= require('socket.io')
const filter = require('bad-words')
const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const publicDirPath = path.join(__dirname,'../public')

app.use(express.static(publicDirPath))

io.on('connection',(socket)=>{
    
    socket.on('join',({username,room},callback)=>{
        const {error,user} = addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',` ${user.username} has joined!`))
        callback()
    })

    socket.on('sendmessage',(message,callback)=>{
        const user= getUser(socket.id)
        const filterinstance= new filter()
        if(filterinstance.isProfane(message)){
            return callback('Bad words not allowed')
        }
        
        if(user){
            io.to(user.room).emit('message',generateMessage(user.username,message))
            callback()
        }
        
    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the chat!`))
    
        }
    })
    socket.on('geolocation',(location,callback)=>{
        const user= getUser(socket.id)
        socket.to(user.room).emit('location',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
})

io.on('geolocation',(socket)=>{})

server.listen(port,()=>{
    console.log('server is running on port '+ port)
})

