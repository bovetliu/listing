var express = require('express'),
  bodyParser = require('body-parser'),
  logger = require('morgan'),
  routes = require('./routes/index.js');
 var cors = require('cors');

var mongoose = require('mongoose'),
    db_models = require('./db_models/index.js'),
    db_url = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://@localhost:27017/',
    db = mongoose.connect(db_url+"esapi", {safe: true}),
    id = mongoose.Types.ObjectId();



var app = express();
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());
app.use(logger('dev'));
 
app.use(cors());
// process headers
 
// available "db_model" are "Route","RentalPoint","DetailedRentalListing"  
app.param('db_model', function(req, res, next, db_model){
  req.db_model = db_models[db_model];
  return next();
})

//main page welcome 
app.get('/', function(req, res, next) {
  res.send('Select a db_model, e.g., /db_models/Route')
})

//browse all data in one collections 
app.get('/db_models/:db_model', function(req, res, next) {
  req.db_model.find({},null, {} , function (e, results) {
    if (e) return next(e);
    if (results == null) res.send([]);
    else res.send( results);

  });
})

// create one entry in corresponding model 
app.post('/db_models/:db_model', function(req, res, next) {
  var instance = new req.db_model(req.body);
  instance.save(function(e){
    if (e) return next(e);
    res.send(instance);
    console.log("created following new instance:")
    console.log(instance);
  });
  //req.db_model.create(req.body, function(e, results){
  //  if (e) return next(e)
  //  res.send(results);
  //})
})

app.get('/db_models/:db_model/conditional',routes.adaptiveGet );  // passed
 
app.get('/db_models/:db_model/:id', function(req, res, next) {   // passed
  //console.log("48: " + req.params.id);
  req.db_model.findOne({_id: req.params.id }, null,{},function(e, result){
    if (e) return next(e)
    if(!result) {
      res.status(404).send("Not Found");
    }
    res.send(result)
  })
})
 
app.post('/db_models/:db_model/:id/update', function(req, res, next) { //passed
  console.log("[INFO] \"post\" update with a request body of " + JSON.stringify(req.body));
  req.db_model.update({_id: req.params.id},
    {$set: req.body},
    {safe: true, multi: false}, function(e, result){
    if (e) return next(e)
    console.log(result);
    if (result.n <1){ 
      res.status(404).send(result);
      return 
    }
    res.send(result);
  })
})
 

app.delete('/db_models/:db_model/:id', function(req, res, next) {
  req.db_model.remove({_id: req.params.id}, function(e, result){
    if (e) return next(e)
    res.send(result);
  })
})
 

var port = process.env.OPENSHIFT_NODEJS_PORT || 3001;
var ip   = process.env.OPENSHIFT_NODEJS_IP  || '127.0.0.1'

app.listen(port,ip ,null, function(){
  console.log( "server listening: " + ip + ":" +port );
});