const mongoose = require('mongoose')

const carnetSchem = mongoose.Schema({
    name: String,
    room: String,
    canvas: Map
})

module.exports = mongoose.model('carnet', carnetSchem)