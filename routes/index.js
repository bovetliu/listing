var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // if (req.isAuthenticated()){
  //   console.log("Authenticated");
  // } else {
  //   console.log("Not Authenticated");
  // }
  res.render('index.jade', { 
  	title: 'mainsite | EasySublease.com',
    nav_title:"mainsite | EasySublease",
    online_sample:"559418e1731b61add4b8d532",
    local_sample:"55cc02d52db48c0d19116dfd",
    user: req.user,
    isAuthenticated: req.isAuthenticated()  // req.isAuthenticated() is a method added by passport
  });
});


router.get('/interview_demo', function(req, res, next) {
  // if (req.isAuthenticated()){
  //   console.log("Authenticated");
  // } else {
  //   console.log("Not Authenticated");
  // }
  res.render('interview_demo.jade', { 
    title: 'new easysublease.com listing page demo',
    nav_title:"demo | EasySublease",
    online_sample:"559418e1731b61add4b8d532",
    local_sample:"55cc02d52db48c0d19116dfd",
    user: req.user,
    isAuthenticated: req.isAuthenticated()  // req.isAuthenticated() is a method added by passport
  });
});


router.get('/howitworks', function(req, res, next){
  res.render('howitworks.jade',{
    user: req.user,
    isAuthenticated: req.isAuthenticated()  // req.isAuthenticated() is a method added by passport
  });
});

module.exports = router;
