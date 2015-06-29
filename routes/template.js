var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('template.jade', {"similar_listing":"similar_listing 1 2 3"});
});

router.get('/dropzone', function(req, res, next){
  res.render('dropzone.jade',{});
})
module.exports = router;
