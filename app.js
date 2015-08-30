var express = require('express');       //package.json has info
var path = require('path');
var favicon = require('serve-favicon');     //package.json has info
var logger = require('morgan');             //package.json has info
var session = require('express-session');   //package.json has info
var cookieParser = require('cookie-parser'); //package.json has info
var bodyParser = require('body-parser');      //package.json has info
var methodOverride = require('method-override');  //package.json has info
var multer = require("multer");  // newly added, regarding init express   //package.json has info
var cors = require('cors');    //package.json has info

var passport = require('passport');    //package.json has info
var passportLocal = require('passport-local');     //package.json has info
var FacebookStrategy = require('passport-facebook').Strategy;    //package.json has info

var FACEBOOK_APP_ID = process.env.FB_APP_ID;
var FACEBOOK_APP_SECRET = process.env.FB_APP_SECRET;


// I should be using different FB credentials between local and openshift server
if (!FACEBOOK_APP_ID  || !FACEBOOK_APP_SECRET) console.log("[WARNING] application is running without FB variables, FB_APP_ID:" + FACEBOOK_APP_ID);
else console.log("[INFO] application is running with FB variables %s, %s.",FACEBOOK_APP_ID, FACEBOOK_APP_SECRET );

/*if this app is running on openshift, env var should have OPENSHIFT_MONGODB_DB_URL*/
var db_literal = (process.env.OPENSHIFT_MONGODB_DB_URL)?"listingtest":"esapi";

var mongoose = require('mongoose'),  // newly added, regarding init express
    db_models = require('./db_models/index.js'),
    db_url = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://@localhost:27017/',
    db = mongoose.connect(db_url+db_literal, {safe: true}),
    id = mongoose.Types.ObjectId();


/*routers*/
var index_rt = require('./routes/index.js');
var s3lib = require('./routes/s3lib.js');
var data_api_router = require('./routes/data_api_router.js'),
    user_router = require('./routes/user_router.js');
var template = require('./routes/template.js'); 
var listing_lib = require('./routes/listing_lib.js');
var app = express();
 
// var imageServerPdath='https://esimgserver.s3.amazonaws.com';

// app configuration
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
app.use(methodOverride());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge:2678400}
}));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

/* passport configuration*/
/*configure passport*/

// Remind myself: currently not using facebook
//   Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.

var callbackURL = (process.env.OPENSHIFT_MONGODB_DB_URL)?"http://www.easysublease.com/auth/facebook/callback":"http://localhost:3000/auth/facebook/callback";
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.

      db_models.User.findOne({"facebook_user_id":profile.id},null,{},function (err, instance) {
        if (err) { 
          console.log(err.message);
          return next(err);
        } 
        else if (!instance){
          // use are using un-associated facebook account to login
          /* for dev. ref.
            {  // for dev reference
              "id":"1106067409423006",
              "displayName":"Bowei Liu",
              "name":{},
              "provider":"facebook",
            }
          */
          var new_user = {};
          new_user.email = null;
          new_user.password_hash = null;
          var name_arr = profile.displayName.split(" ");
          new_user.first_name = name_arr[0];
          new_user.last_name = name_arr[name_arr.length-1] ;
          new_user.receive_updates = true;
          new_user.auth_level = 1;     // 1 is common user
          new_user.facebook_user_id = profile.id;   // This line is important
          new_user = new db_models.User(new_user);
          new_user.save(function (error){
            if (error) return next(error);
            delete new_user.password_hash;
            done(null, new_user.toObject());
          });
        }
        else {
          // find associated account
          var instance_result = instance.toObject();
          delete instance_result.password_hash;
          done(null, instance_result);
        }
      }) // end of findOne
    });
  }
));

passport.use(new passportLocal.Strategy({
  usernameField: 'email',
  passwordField: 'password'
  },
  verifyCredentials));

// The verification function used by Passport Local strategy
function verifyCredentials(email, password, done) {
    // Pretend this is using a real database!
    //Model.findOne(query, [fields], [options], [callback(error, doc)]): finds the first document that matches the query
    db_models.User.findOne({"email":email},null,{},function(err, instance){
      if (err) { 
        console.log(err.message);
        return next(err);
      }
      else if(!instance) {
        done(null, null);
      } else{
        var instance_result = instance.toObject(); // convert mongoose instance into JSON-lized object
        if (instance_result.password_hash === password){
          delete instance_result.password_hash;
          done(null, instance_result);  // pass the whole user profile
        } else{
          // Not authenticated
          done(null, null);
        }
      }
    });// end of findOne
}

/* seems that javascript obj cannot be serialized into session*/
/*passport is gonna invoke this function for dev.*/
/*added by author ad 37:00*/
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(_id, done) {
    // Query database or cache here!!
    db_models.User.findOne({"_id":_id},null,{},function(err, instance){
      //instance is an instance of User Model
      if (err) { 
        console.log(err.message);
        return next(err);
      }
      else if(!instance) {
        done(null, null);
      } else{
        var instance_result = instance.toObject(); // convert mongoose instance into JSON-lized object
        delete instance_result.password_hash;
        done(null, instance_result);
      }
    });
});


// every req has db_model as DetailedRentalListing
app.use(function(req, res, next){
  req.DB_Listing = db_models.DetailedRentalListing;
  req.DB_USER = db_models.User;
  return next();
})

app.use('/', index_rt);
app.use('/template', template);
app.use('/data_api', data_api_router);
// app.post('/user/login', user_router.login);  // user_router.login is method returns to 

app.post('/user/login', passport.authenticate('local'), function(req, res) {
  res.redirect('back');   
}); 

app.post('/user/signup', function handlerSignUp (req, res, next){
  var new_user = {};
  new_user.email = req.body.email;
  new_user.password_hash = req.body.password;   //TODO one method is needed here
  new_user.first_name = req.body.first_name;
  new_user.last_name = req.body.last_name;
  new_user.receive_updates = req.body.receive_updates|| false;
  new_user.auth_level = 1;     // 1 is common user
  new_user = new req.DB_USER(new_user);
  new_user.save(function (error){
    if (error) return next(error);
    res.json(new_user.email);   // TODO send email here
  });
});


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
    res.redirect('back');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('back');  
});




app.post('/user/reset_password', function handlerResetPassword (req, res, next){
  // TODO 
  req.DB_USER.findOne({"email": req.body.email.trim()}, null,{}, function(err, instance){
    if (err) { 
      console.log(err.message);
      return next(err);
    }
    else if(!instance) {
      res.status(404).send("cannot find user: " + req.body.email);
    } else{
      var instance_result = instance.toObject(); // convert mongoose instance into JSON-lized object
      // TODO: send reset link to target email
      res.send("reset link has been sent to " + instance_result.email + ".");
    }
  });
});
/*edit mode*/
app.get('/edit/:id', function(req, res, next){
  listing_lib.renderJade(req,res,next,true);
});

/*listing mode*/
app.get('/listing/:id', function(req, res, next){
  listing_lib.renderJade(req,res,next,false);
});
app.post('/listing', function(req,res,next){
  var instance = new req.DB_Listing( JSON.parse(req.body.model) );
  console.log(req.body.model)
  // console.log(JSON.stringify(instance));
  instance.save(function(e){
    if (e) return next(e);
    res.redirect('back'); 
    
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