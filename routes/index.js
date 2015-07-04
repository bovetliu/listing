var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'new easysublease.org listing page demo',
    online_sample:"559418e1731b61add4b8d532",
    local_sample:"5593aa9e48f2890a9a0f2929"  
   });
});

router.get('/howitworks', function(req, res, next){
  res.render('howitworks.jade',{});
});

module.exports = router;
