var mongoose = require('mongoose');
var _ = require('underscore');
var user_schema = new mongoose.Schema({
  "first_name":String,
  "last_name":String,
  "password_hash":String,
  "email":String,
  "auth_level":{type:Number, min:0, max:4},
  "receive_updates":Boolean,
  //regarding OAuth
  "facebook_user_id":Number,
  "google_user_id":Number // currently I don't know how google user id is specified
},{ collection:'user'});

// define instance methods
user_schema.method({
  displayName: function(){
    return this.first_name + " " + this.last_name;
  },
  resetPassword: function(){
    console.log("user.js 20: code placehoder");
  }
});

module.exports = mongoose.model('User',user_schema);