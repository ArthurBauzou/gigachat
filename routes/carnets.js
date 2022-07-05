var express = require('express');
var router = express.Router();

router.get('/:room', (req,res) => {
    console.log(req.params.room)
    res.send('cool')
});
// router.put('/r/:room/carnets/:name', carnets.put)

module.exports = router;