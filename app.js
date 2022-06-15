const express = require('express');
const app = express();
const http = require('http').createServer(app);
const crypto = require('crypto')
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://glub.fr', 'http://glub.fr:4200']
  }
})

let sockets = {}
let userlist = []

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
app.use('/', indexRouter);
app.use('/users', usersRouter);

// DOSSIER DES VUES ET RESSOURCES STATIQUES
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// SOCKET
io.on('connection', (socket) => {

  socket.on('send0', (msg) => {
    io.emit('msg0', msg)
  })
  socket.on('join0', (user) => {
    if(!userlist.find( u => u.id == user.id )) {userlist.push(user)}
    sockets[socket.id] = {id: user.id, name: user.name}
    console.log(`CONNECTED user ${sockets[socket.id].name}`);
    io.emit('user0', userlist)
  })
  socket.on('color0', (user) => {
    let ucol = userlist.findIndex( u => u.id == user.id )
    userlist[ucol].color = user.color;
    io.emit('user0', userlist)
  })
  socket.on('disconnect', () => {
    console.log(`DISCONNECTED user ${sockets[socket.id].name}`);
    let udel = userlist.findIndex( u => u.id == sockets[socket.id].id );
    userlist.splice(udel, 1);
    io.emit('user0', userlist);
    delete sockets[socket.id];
    socket.removeAllListeners();
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
