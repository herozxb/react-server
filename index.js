const { ApolloServer, PubSub } = require('apollo-server');
const mongoose = require('mongoose');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { MONGODB } = require('./config.js');

const pubsub = new PubSub();

const PORT = process.env.port || 5000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub })
});

mongoose
  .connect(MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log('MongoDB Connected');
    return server.listen({ port: PORT });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  })
  .catch(err => {
    console.error(err)
  })
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom, get_user_by_name,remove_user_by_name,get_user_id_by_name } = require('./users');

const router = require('./router');

const app = express();
const server_chat = http.createServer(app);
const io = socketio(server_chat);

app.use(cors());
app.use(router);

io.on('connect', (socket) => {

  socket.on('logout', ({ name, room }, callback) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //console.log("=========0.1.0.1========");
    const user_get = get_user_id_by_name(name); //worked
    //console.log(user_get);
    //console.log("=========0.1.0.2========");
    const user = remove_user_by_name(name);
    //console.log(user);
    //console.log(io.sockets.connected[socket.id]);
    //console.log(socket.id);
    //s7n3hgQhHlQ3QRhiAAAF
  });

  socket.on('join', ({ name, room }, callback) => {

    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //console.log("=========1.0========");
    
    let { error, user } = addUser({ id: socket.id, name, room });
    //console.log(socket.id);
    //console.log(user);
    //console.log(error);


    //console.log("=========1.0.1========");
    //const user_get = get_user_id_by_name(name); //worked
    //console.log(user_get);

    //user = user_get;
    //console.log("=========1.0.1.1========");
    //console.log(user);

//    console.log("=========1.0.2========");
//    const user_in_room = getUsersInRoom(room);
//    console.log(user_in_room);
//    console.log(user_in_room[0].name);
//    console.log(name);

//    if (user_in_room[0].name === name ) 
//    {
//      console.log("=========1.0.2.1========");
//      console.log(user_in_room);
//    };

    //if (io.sockets.connected[user_in_room.id]) {
    //  io.sockets.connected[user_in_room.id].disconnect();
    //}


    //console.log("=========1.0.3========");
    //const user_by_id = getUser(socket.id);
    //console.log(user_by_id);

    if(error)
    { 
      //console.log("=========1.1========");
      //console.log(socket.id);
      //io.sockets.connected[socket.id].connect();
      //const user_previous = remove_user_by_name(name);
      //console.log(user_previous.room);
      //socket.emit('message', { user: 'admin', text: `same use .`});
      return callback(error);
    }
    //console.log("=========2.0========");
    //console.log(user.room);
    socket.join(user.room);


    socket.emit('message', { user: 'admin', text: `${user.name}, 欢迎来到${user.room}房间`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    if(user===null)
    {}
    else
    {
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    if(user===null)
    {}
    else
    {
      io.to(user.room).emit('message', { user: user.name, text: message });
    }

    callback();
  });

  socket.on('disconnect', (test) => {
    console.log(test);
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} 离开了房间.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })
});

server_chat.listen(process.env.PORT || 2001, () => console.log(`Server has started.`));