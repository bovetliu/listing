// var passport = require('passport');    //package.json has info
var passportLocalStrategy = require('passport-local').Strategy;     //package.json has info
var FacebookStrategy = require('passport-facebook').Strategy;    //package.json has info
var helper = require('./helper.js');
local_utilities ={}; // this one will be populated when configurePassport() is invoked
// The verification function used by Passport Local strategy
function verifyCredentials(email, password, done) {
    // Pretend this is using a real database!
    //Model.findOne(query, [fields], [options], [callback(error, doc)]): finds the first document that matches the query
    local_utilities['db_models'].User.findOne({"email":email},null,{}, function verifyCredentialsCB (err, instance){
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

function ensureAPIAuthenticated ( req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    var error = new Error("Not authorized"); error.status =  401;
    return res.status(401).json({"error":error});
  }
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    return next(helper.poulateError(new Error, 401, "Unauthorized action, loggin required"));
  }
}

exports.verifyCredentials = verifyCredentials;
exports.ensureAPIAuthenticated = ensureAPIAuthenticated;
exports.ensureAuthenticated = ensureAuthenticated;
exports.configurePasssport = function (app, db_models, passport){
  // initialize passport
  local_utilities['db_models'] = db_models;
  app.use(passport.initialize());
  app.use(passport.session());
  var callbackURL = (process.env.OPENSHIFT_MONGODB_DB_URL)?"http://www.easysublease.com/auth/facebook/callback":"http://localhost:3000/auth/facebook/callback";
  var FACEBOOK_APP_ID = process.env.FB_APP_ID;
  var FACEBOOK_APP_SECRET = process.env.FB_APP_SECRET;
  if (!FACEBOOK_APP_ID  || !FACEBOOK_APP_SECRET) console.log("[WARNING] application is running without FB variables, FB_APP_ID:" + FACEBOOK_APP_ID);
  else console.log("[INFO] application is running with FB variables %s, %s.",FACEBOOK_APP_ID, FACEBOOK_APP_SECRET );
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
            // use are using un-associated facebook account to login, we first create one user account to associate this user accout with this FB_user_id
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

  passport.use(new passportLocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    },
    verifyCredentials));

  /* seems that javascript obj cannot be serialized into session*/
  /*passport is gonna invoke this function for dev.*/
  /*added by author ad 37:00*/
  passport.serializeUser(function(user, done) {
      done(null, user._id);
  });

  passport.deserializeUser(function(_id, done) {
      // Query database or cache here!!
      local_utilities['db_models'].User.findOne({"_id":_id},null,{},function(err, instance){
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
          // done(null, instance_result);
          done(null, instance);  // hoping req.User is one Mongoose Model instance
        }
      });
  });

  return passport;
}