var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var multer = require("multer");  // newly added, regarding init express
var cors = require('cors');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var FACEBOOK_APP_ID = process.env.FB_APP_ID.trim();
var FACEBOOK_APP_SECRET = process.env.FB_APP_SECRET.trim();

// var FACEBOOK_APP_ID = "912860235451001";
// var FACEBOOK_APP_SECRET = "1161273f59b2a82264d03b692eb48c15";
if (!FACEBOOK_APP_ID  || !FACEBOOK_APP_SECRET) console.log("[WARNING] application is running without FB variables, FB_APP_ID:" + FACEBOOK_APP_ID);
else console.log("[INFO] application is running with FB variables %s, %s",FACEBOOK_APP_ID, FACEBOOK_APP_SECRET );

var db_literal = (process.env.OPENSHIFT_MONGODB_DB_URL)?"listingtest":"esapi";

var mongoose = require('mongoose'),  // newly added, regarding init express
    db_models = require('./db_models/index.js'),
    db_url = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://@localhost:27017/',
    db = mongoose.connect(db_url+db_literal, {safe: true}),
    id = mongoose.Types.ObjectId();

/*configure passport*/
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));


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
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge:60000000}
}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

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





// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
});

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});




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