const express = require('express');
const app = express();
const http = require('http').createServer(app);
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://glub.fr', 'http://glub.fr:4200']
  }
})

let sockets = {}
let userlist = {}

// const dbconfig = require('./database/database.config')
mongoose.connect('mongodb://localhost/gigabase')

// UTILIATIRES
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var path = require('path');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ROUTES
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var carnetsRouter = require('./routes/carnets');
app.use('/', indexRouter);
app.use('/u', usersRouter);
app.use('/r', carnetsRouter);

// DOSSIER DES VUES ET RESSOURCES STATIQUES
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// SOCKET
io.on('connection', (socket) => {

  socket.on('send0', (msg) => {
    io.emit('msg0', msg)
  })

  socket.on('dice0', (res) => {
    socket.broadcast.emit('dice1', res)
  })

  socket.on('path0', (path) => {
    socket.broadcast.emit('path1', path)
  })

  socket.on('modif0', (modif) => {
    socket.broadcast.emit('modif1', modif)
  })

  socket.on('join0', (user) => {
    // stockage user et socket(s) dans la table des USERS
    if (userlist[user.id]) {
      userlist[user.id].sockets.push(socket.id)
      console.log(`CONNECTED user ${userlist[user.id].name} on socket n°${userlist[user.id].sockets.length}`);
    } else {
      userlist[user.id] = {name: user.name, color: user.color, sockets: [socket.id]}
      console.log(`CONNECTED user ${userlist[user.id].name}`);
    }
    // stockage du user dans la tables des SOCKETS (pour la déconnexion)
    sockets[socket.id] = {userId: user.id, userName: user.name}
    // envoi d’un jwt
    let token = jwt.sign( user, "monsecretinutilelol" )
    socket.emit('token0', token)
    io.emit('user0', userlist)
    console.log(userlist)
  })

  socket.on('color0', (user) => {
    userlist[user.id].color = user.color
    io.emit('user0', userlist)
    // mise à jour du token
    let token = jwt.sign( user, "monsecretinutilelol" )
    socket.emit('token0', token)
  })

  socket.on('disconnect', () => {
    // suppression dans la table USERS
    if (sockets[socket.id]) {
      let userid = sockets[socket.id].userId;
      let i = userlist[userid].sockets.findIndex(id => id == socket.id)
      userlist[userid].sockets.splice(i,1)
      if (userlist[userid].sockets.length == 0) {
        delete userlist[userid]
        console.log(`DISCONNECTED user ${sockets[socket.id].userName} (final)`);
      } else {
        console.log(`DISCONNECTED user ${sockets[socket.id].userName} from socket ${socket.id}`);
      }
      // suppression dans la table des SOCKETS
      delete sockets[socket.id];
      io.emit('user0', userlist);
      socket.removeAllListeners();
    }
    else {
      console.log("deconnexion d’un utilisateur inconnu")
    }
  })

})
// SOCKET END


http.listen(3000, () => {
  console.log('listening on port 3000')
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
