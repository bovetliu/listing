var mongoose = require('mongoose');
var _ = require('underscore');
var user_schema = new mongoose.Schema({
  "first_name":String,
  "last_name":String,
  "password_hash":String,
  "email":String,
  "auth_level":{type:Number, min:0, max:4},
  "receive_updates":Boolean,
  "wishlist":Array,    // ObjectId literal array
  //regarding OAuth
  "facebook_user_id":Number,
  "google_user_id":Number // currently I don't know how google user id is specified
},{ collection:'user'});

// define instance methods
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
  resetPassword: function(){
    console.log("user.js 20: code placehoder");
  }
});

// helper function of schema
var saveCB = function( err, instance){
  if (err) console.log("[! ERROR !]  NOT successfully saved");
  else console.log("[INFO] "+ instance._id +" saved. ");
};

module.exports = mongoose.model('User',user_schema);