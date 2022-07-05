var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/cv', function(req, res, next) {
  console.log('haha')
  res.render('index', { title: 'Glub' });
});

module.exports = router;
