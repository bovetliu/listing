var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'new easysublease.org listing page demo',
    online_sample:"55910d94008d84ed2912e1ae",
    local_sample:"5593aa9e48f2890a9a0f2929"  
   });
});

module.exports = router;
