var socketio = require('socket.io');

var io;
// maps socket.id to user's nickname
var usernames = {};
var numUsers = 0;
// list of socket ids
// var clients = [];
var namesUsed = [];
var rooms = ['lobby', 'C++', 'JavaScript']
exports.listen = function(server){
  io = socketio.listen(server);
  io.set('log level', 2);
  io.sockets.on('connection', function(socket){
    // initializeConnection(socket);
    addUser(socket);
    handleClientDisconnections(socket);
    // handleMessageBroadcasting(socket);
    // handlePrivateMessaging(socket);
    usersConnected(socket);
    create(socket);
    addUser(socket);
    sendChat(socket);
    switchRoom(socket);
  });
}
function usersConnected(socket){
  socket.on('connection', function(socket){
    console.log('in the users Connected method');
    var clients = io.sockets.clients();
    console.log(clients);
    socket.emit('users', clients);
  })
}
function create(socket){
  socket.on('create', function(room) {
    console.log('creating room:'.green + room);
       rooms.push(room);
       console.log(rooms);
       socket.emit('updaterooms', rooms, socket.room);
   });
}

function sendChat(socket){
  socket.on('sendchat', function(data){
    console.log(data);
    console.log(socket.username)
    io.sockets["in"](socket.room).emit('updatechat', socket.username, data);
  })
}
function switchRoom(socket){
  socket.on('switchRoom', function(newroom){
    console.log('in the switchtoom server socket method'.yellow);
    var oldroom;
    oldroom = socket.room;
    socket.join(newroom);
    console.log(socket.username);
    console.log(socket.room);
    socket.emit('updatechat', 'SERVER', 'you have connected to' + newroom);
    socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + 'has left this room');
    socket.room = newroom;
    socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
    socket.emit('updaterooms', rooms, newroom);
  })
}
// function initializeConnection(socket){
//   // showActiveUsers(socket);
//   // showOldMsgs(socket);
// }

// function showActiveUsers(socket){
//   var activeNames = [];
//   var usersInRoom = io.sockets.clients();
//   for (var index in usersInRoom){
//     var userSocketId = usersInRoom[index].id;
//     if (userSocketId !== socket.id && nicknames[userSocketId]){
//       var name = nicknames[userSocketId];
//       activeNames.push({id: namesUsed.indexOf(name), nick: name});
//     }
//   }
//   socket.emit('names', activeNames);
// }

// function showOldMsgs(socket){
//   db.getOldMsgs(5, function(err, docs){
//     socket.emit('load old msgs', docs);
//   });
// }

function addUser(socket){
  socket.on('addUser', function(username) {
    console.log('in the add user function')
    console.log(username);
    socket.username = username;
    console.log('now printing' + socket.username);
    socket.room = 'lobby';
    numUsers++;
    usernames[username] = username;
    console.log(usernames);
    console.log('usernames object' + usernames);
    socket.join('lobby');
    socket.emit('updatechat', 'SERVER', 'you have connected to Lobby');
    socket.broadcast.to('Lobby').emit('updatechat', 'SERVER', username + ' has connected to this room');
    socket.emit('updaterooms', rooms, 'Lobby');
    socket.emit('users', usernames);
    // clients[ind] = socket;
    // // nicknames[socket.id] = username;
    // io.sockets.emit('new user', {id: ind, username: username});
    });
  }
function visitRoom(socket){
  socket.on('visitRoom', function(room){
    console.log(room);
    socket.emit('the_room', socket.room);
  })
}

// function handleMessageBroadcasting(socket){
//   socket.on('message', function(msg){
//     var nick = nicknames[socket.id];
//     db.saveMsg({nick: nick, msg: msg}, function(err){
//       if(err) throw err;
//       io.sockets.emit('message', {nick: nick, msg: msg});
//       console.log("saving and emmmiting message", msg);
//     });
//   });
// }
//
// function handlePrivateMessaging(socket){
//   socket.on('private message', function(data){
//     var from = nicknames[socket.id];
//     clients[data.userToPM].emit('private message', {from: from, msg: data.msg});
//   });
// }

function handleClientDisconnections(socket){
  socket.on('disconnect', function(){
  		// remove the username from global usernames list
  		delete usernames[socket.username];
  		// update list of users in chat, client-side
  		io.sockets.emit('updateusers', usernames);
  		// echo globally that this client has left
  		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  		socket.leave(socket.room);
  	});
}
