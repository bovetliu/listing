var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require("multer");  // newly added, regarding init express
var cors = require('cors');

var db_literal = (process.env.OPENSHIFT_MONGODB_DB_URL)?"listingtest":"esapi";

var mongoose = require('mongoose'),  // newly added, regarding init express
    db_models = require('./db_models/index.js'),
    db_url = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://@localhost:27017/',
    db = mongoose.connect(db_url+db_literal, {safe: true}),
    id = mongoose.Types.ObjectId();

/*routers*/
var index_rt = require('./routes/index.js');
var s3lib = require('./routes/s3lib.js');
var data_api_router = require('./routes/data_api_router.js');
var template = require('./routes/template.js'); 
var listing_lib = require('./routes/listing_lib.js');
var app = express();
 
// var imageServerPdath='https://esimgserver.s3.amazonaws.com';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.OPENSHIFT_NODEJS_PORT|| 3000);  
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req, res, next){
  req.db_model = db_models.DetailedRentalListing;
  return next();
})
app.use('/', index_rt);

app.use('/template', template);
app.use('/data_api', data_api_router);

/*edit mode*/
app.get('/edit/:id', function(req, res, next){
  listing_lib.renderJade(req,res,next,true);
});

/*listing mode*/
app.get('/listing/:id', function(req, res, next){
  listing_lib.renderJade(req,res,next,false);
});
app.post('/listing', function(req,res,next){

  var instance = new req.db_model( JSON.parse(req.body.model) );
  console.log(req.body.model)
  // console.log(JSON.stringify(instance));
  instance.save(function(e){
    if (e) return next(e);
    res.send(instance.toObject());
    
  });
})
app.delete('/edit/:id/:filename', s3lib.procDeleteObject);
app.post('/edit/:id/upload_image',multer(), s3lib.procUpload); // the multer() between '/upload_image' and 's3lib.procUpload' is very importatn
app.post('/edit/:id', listing_lib.dbUpdateAttr);



// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handlers
// development error handler
// // will print stacktrace
if (app.get('env') === 'development') {
 
  app.use(function(err, req, res, next) {
    console.log("dev error handler invoked");
    console.log(err.stack);
    res.status(err.status || 500).render('error.jade',{"error":err});
    
  });
}
else{
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
      console.log("production mode error handler invoked");
      res.setHeader("Content-Type", "text/html");
      res.status(err.status || 500).render('error.jade',{"error":err});
  });
} 

// var server = http.createServer(app);
// var boot = function () {
//   server.listen(app.get('port'), function(){
//     console.info('Express server listening on port ' + app.get('port'));
//   });
// }
// var shutdown = function() {
//   server.close();
// }
// if (require.main === module) {
//   boot();
// } else {
//   console.info('Running app as a module')
//   exports.boot = boot;
//   exports.shutdown = shutdown;
//   exports.port = app.get('port');
// }
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var ip   = process.env.OPENSHIFT_NODEJS_IP  || '127.0.0.1'

app.listen(port,ip ,null, function(){
  console.log( "server listening: " + ip + ":" +port );
});