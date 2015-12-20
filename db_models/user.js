var mongoose = require('mongoose');
var _ = require('underscore');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service:'gmail',
  auth :{
    user:process.env.EMAIL_ACCOUNT,
    pass:process.env.EMAIL_PSW
  }
}, {
  from:process.env.EMAIL_ACCOUNT
});
// transporter.sendMail({
//     from: 'sender@address',
//     to: 'receiver@address',
//     subject: 'hello',
//     text: 'hello world!'
// });
var user_schema = new mongoose.Schema({
  "first_name":String,
  "last_name":String,
  "password_hash":String,
  "email":String,
  "auth_level":{type:Number, min:0, max:4},
  "receive_updates":Boolean,
  "facebook_user_id":Number,
  "google_user_id":Number, // currently I don't know how google user id is specified
  "passwordreset":String
},{ collection:'user'});

// define instance methods

// http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}
user_schema.method({
  addOneListingToWishList:function( id_literal, purpose_literal ){
    var index  = this.wishlist.indexOf(id_literal);
    if (purpose_literal === "add") {
      if (index < 0){
        // current wishlist does not have this listing
        this.wishlist.push(id_literal);
      } 
    } else if (purpose_literal === "cancel"){
      if (index >= 0 ){
        this.wishlist.splice(index,1);
      }
    }
    this.save( saveCB);
  },
  displayName: function(){
    return this.first_name + " " + this.last_name;
  },
  getOnePasswordReset :function( attempt, callback){
    var user = this;
    user.model("User").findOne({passwordreset: attempt }).exec(function (err, user){
      if (err) return callback(err, null);
      if (user){  // find in db, there is another one with the same password reset, so try another random string
        var new_attempt = randomString(30);
        return user.getOnePasswordReset(new_attempt, callback);
      }
      return callback(null, attempt);
    });
  },
  resetPassword: function(cb){
    var user = this;
    user.getOnePasswordReset(randomString(30), function (err, valid_passwordreset){
      if (err) return cb(err);
      user.passwordreset = valid_passwordreset;
      var resetUrl = (process.env.local)?'http://127.0.0.1:3000/user/resetpassword?passwordreset=':'http://www.easysublease.com/user/resetpassword?passwordreset=';
      
      user.save(function (err){
        if (err) return cb(err);
        transporter.sendMail({
          to:user.email,
          subject:'reset password',
          text: resetUrl+ user.passwordreset
        },cb);
      }); 
    });

  }
});

// helper function of schema
var saveCB = function( err, instance){
  if (err) console.log("[! ERROR !]  NOT successfully saved");
  else console.log("[INFO] "+ instance._id +" saved. ");
};

module.exports = mongoose.model('User',user_schema);