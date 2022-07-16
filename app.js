const express = require('express');
const app = express();
const http = require('http').createServer(app);
const jwt = require('jsonwebtoken')
// const mongoose = require('mongoose')
const io = require('socket.io')(http, {
  cors: {
    origins: ['http://glub.fr', 'http://glub.fr:4200']
  }
})
const fabric = require("fabric").fabric;

let sockets = {}
let userlist = {}
let userdocs = new Map
let layers = []

// mongoose.connect('mongodb://localhost/gigabase')

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

// GESTION DOCUMENTS

function editLayers(lobj) {
  switch(lobj.type) {
    case 'new' :
      userdocs.get(lobj.userid)[lobj.index] = new fabric.Group()
      layers.push({
        userid: lobj.userid,
        username: userlist[lobj.userid].name,
        color: userlist[lobj.userid].color,
        index: lobj.index
      })
      break;
  }
}

function addToGroup(id,index,path) {
  if (secuCheck(id,index)) { console.log('pas de document ici');return }
  fabric.util.enlivenObjects([path], (objects)=> {
    objects.forEach((o) => {
      userdocs.get(id)[index].addWithUpdate(o)
    })
  },'fabric')
  console.log(`Doc ${index} de ${userlist[id].name} : ${userdocs.get(id)[index]._objects.length} objets`)
}

function modifGroup(id,index,modif) {
  if (secuCheck(id,index)) { console.log('pas de document ici');return }
  let amod = userdocs.get(id)[index]
  amod.top = modif.top
  amod.left = modif.left
  amod.angle = modif.angle
  amod.scaleX = modif.scaleX
  amod.scaleY = modif.scaleY
  amod.flipX = modif.flipX
  amod.flipY = modif.flipY
}

function deleteGroups(delobj) {
  let grpdel = userdocs.get(delobj.userid)
  if (!grpdel) {return}
  switch (delobj.type) {
    case 'all':
      userdocs.set(delobj.userid, [])
      let newlayers = layers.filter(l => l.userid != delobj.userid)
      layers = newlayers
      break;
    case 'undo':
      let rmobj = grpdel[delobj.index]._objects[grpdel[delobj.index]._objects.length-1]
      grpdel[delobj.index].removeWithUpdate(rmobj)
      break;
  }
}

// envoie les documents des autres deja presents sur le serveur
function sendDocs(socket,user) {
  for (let usr of userdocs) {
    if (usr[0] != user) {
      usr[1].forEach((d,i)=>{
        for (let obj of d._objects) {
          let paq = {
            userid: usr[0],
            index: i,
            object: obj
          }
          socket.emit('path1',paq)
        }
        let mod = {
          userid: usr[0],
          index: i,
          modif: {
            top: d.top,
            left: d.left,
            angle: d.angle,
            scaleX: d.scaleX,
            scaleY: d.scaleY,
            flipX: d.flipX,
            flipY: d.flipY
          }
        }
        socket.emit('modif1', mod)
      })
    }
  }
}

function secuCheck(userid,index) {
  if (!userdocs.get(userid) || userdocs.get(userid)[index] == undefined) {
    return true
  }
}

// SOCKET
io.on('connection', (socket) => {

  socket.on('send0', (msg) => {
    io.emit('msg0', msg)
  })
  socket.on('dice0', (res) => {
    socket.broadcast.emit('dice1', res)
  })
  socket.on('layers0', (layerobj) => {
    editLayers(layerobj)
    io.emit('layers1', layers)
  })
  socket.on('path0', (obj) => {
    addToGroup(obj.userid, obj.index, obj.object)
    socket.broadcast.emit('path1', obj)
  })
  socket.on('modif0', (mod) => {
    modifGroup(mod.userid, mod.index, mod.modif)
    socket.broadcast.emit('modif1', mod)
  })
  socket.on('del0', (delObj) => {
    deleteGroups(delObj)
    socket.broadcast.emit('del1', delObj)
  })

  socket.on('color0', (user) => {
    userlist[user.id].color = user.color
    io.emit('user0', userlist)
    layers.forEach(l=>{ if(l.userid == user.id) {l.color = user.color} })
    io.emit('layers1', layers);
    let token = jwt.sign( user, "monsecretinutilelol" )
    socket.emit('token0', token)
  })

  socket.on('join0', (user) => {
    if (userlist[user.id]) {
      userlist[user.id].sockets.push(socket.id)
      console.log(`CONNECTED user ${userlist[user.id].name} on socket n°${userlist[user.id].sockets.length}`);
    } else {
      userlist[user.id] = {name: user.name, color: user.color, sockets: [socket.id]}
      console.log(`CONNECTED user ${userlist[user.id].name}`);
    }
    sockets[socket.id] = {userId: user.id, userName: user.name}
    // envoi d’un jwt
    let token = jwt.sign( user, "monsecretinutilelol" )
    socket.emit('token0', token)
    io.emit('user0', userlist)

    userdocs.set(user.id, [])
    sendDocs(socket,user.id)
  })


  socket.on('disconnect', () => {
    if (sockets[socket.id]) {
      let userid = sockets[socket.id].userId;
      let i = userlist[userid].sockets.findIndex(id => id == socket.id)
      userlist[userid].sockets.splice(i,1)
      if (userlist[userid].sockets.length == 0) {

        delete userlist[userid]
        io.emit('user0', userlist);

        userdocs.delete(userid)
        io.emit('del1', {userid:userid, type:'all'})

        let newlayers = layers.filter(l => l.userid != userid)
        layers = newlayers
        io.emit('layers1', layers);

        console.log(`DISCONNECTED user ${sockets[socket.id].userName} (final)`);
      } else {
        console.log(`DISCONNECTED user ${sockets[socket.id].userName} from socket ${socket.id}`);
      }
      delete sockets[socket.id];
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
