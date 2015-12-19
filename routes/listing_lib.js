var _ = require('underscore');
// var current_page_url = (process.env.local)?"http://localhost:3000/":"http://listingtest-u7yhjm.rhcloud.com/";
var current_page_url = (process.env.local)?"http://localhost:3000/":"http://www.easysublease.com/";
var helper = require("../components/helper.js");

function processReqUser ( req_user){  
  if (req_user) var temp_user = req_user.toObject();
  else return null;
  delete temp_user.password_hash; 
  return temp_user;
}

function renderJade (req, res, next, is_editing) {
  req.DB_Listing.findOne({_id:req.params.id}, null,{},function  renderJadeFindListingCallback (err, instance){
      if (err) { 
        console.log(err.message);
        return next(err);
      }
      if(!instance) {
        return next(helper.populateError(new Error(),404, "requested resource could not be found"));
      }
      var instance_result = instance.toObject();
      console.log(processReqUser(req.user));
      res.render("my_listing.jade",{
        "title": instance_result.listing_related.title,
        "result":instance_result,
        "current_page_url":current_page_url,
        "editing":is_editing,
        "user": processReqUser(req.user),
        "isAuthenticated": req.isAuthenticated(),  // req.isAuthenticated() is a method added by passport
        "editable": (req.isAuthenticated() )?req.user._id.toString() === instance_result.listing_related.lister.toString() :false,
        "saved": (req.isAuthenticated())?req.user.wishlist.indexOf( instance_result._id.toString()) : -1
      });
    // console.log("test editable: " + (req.user)?req.user._id === instance_result.listing_related.lister : false);
  });  
}
exports.renderJade = renderJade;
function ensureRightUser(req, res, next){
  if (req.isAuthenticated()){
    req.DB_Listing.findOne({ _id:req.params.id },null,{},function(error, instance){
      if (error){
        return next(error);
      }
      else if(!instance) {
        return next(helper.populateError(new Error(),404,"requested resource could not be found"));
      }
      else {
        var instance_result = instance.toObject();
        // console.log(JSON.stringify(instance_result));
        if (instance_result.listing_related.lister.toString()=== req.user._id.toString() ){
          next();
        } else{
          return next(helper.populateError(new Error(), 401, "Unauthorized action, although you loggied in"));
        }
      }
    });
  } else {
    return next(helper.populateError(new Error(), 401, "Unauthorized action, correct user needed or need log in"));
  }
}
exports.ensureRightUser = ensureRightUser;

var global_res = "";
var global_next = "";

var updateAttr = function(instance, object, attr_path, value){
  var jb =3;
  // attr_path is one array
  if (attr_path.length == 1){
    // console.log("updateAttr updating value");
    // console.log(attr_path[0]);
    // console.log(value);
    if (value != null && typeof value != 'undefined'){
      // updating 
      if (typeof value  =='object') {
        _.each( _.keys(object[attr_path[0]].toObject()), function(keyname, index, array){
          if (value[keyname]) {
            console.log("setting " + keyname + " true");
            object[attr_path[0]][keyname] = value[keyname];
          }
          else {
            console.log("setting " + keyname + " false");
            object[attr_path[0]][keyname] = false;
          }
        });

      } else {
        object[attr_path[0]] = value;
      }

    }
    else {
      console.log("value value is invalid")
    }
    instance.save( function(err, instance){
      if (err){ console.log("[! ERROR !]  NOT successfully saved");
        return global_next(err);
      }
      else {
        console.log("[INFO] "+ instance._id +" saved. ")
        global_res.status(200).send(instance.toObject());
      };
      global_next = "";
      global_res = "";
    });

    return
  }
  else{
    updateAttr( instance, object[attr_path.shift()], attr_path, value  );
  }
}

exports.dbUpdateAttr = function(req, res , next){
  global_res = res;
  global_next = next;
  _.each(req.body, function(element, key, list){
    console.log(element+"  " + key);
    req.body[key] = JSON.parse(req.body[key]);
  });
  // console.log(req.body);
  req.DB_Listing.findOne({_id:req.params.id} , null, {}, function(err, instance){
    if (err) {
      return next(err);
    }
    if (!instance) {
      res.status(404).send("requested resource cannot be found").end();
      return;
    }

    updateAttr(instance, instance, req.body['attr_path'], req.body['value']);
    console.log("end of updateAttr()")
  });
}

// req.user
//POST '/addToWishList/:id'  content:  "user_id":"id literal"
exports.addListingToWishList = function (req, res, next) {
  var user_id = req.user._id.toString();
  var listing_id = req.params.listingId;
  var purpose  = req.body.purpose;

  req.DB_Listing.findOne({_id:listing_id}, null ,{} , function (err, target_listing) {
    if (err) return next (err);
    if (!target_listing) return res.status(404).send("requested listing cannot be found");
    // now I know this listing is a valid one

    req.user.addOneListingToWishList(listing_id, purpose);
    res.json( processReqUser(req.user));
  })

}
