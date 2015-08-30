var _ = require('underscore');
// var current_page_url = (process.env.local)?"http://localhost:3000/":"http://listingtest-u7yhjm.rhcloud.com/";
var current_page_url = (process.env.local)?"http://localhost:3000/":"http://listing.easysublease.org/";


exports.renderJade = function( req, res, next, is_editing){
  req.DB_Listing.findOne({_id:req.params.id}, null,{},function(err, instance){
      if (err) { 
        console.log(err.message);
        return next(err);
      }
      if(!instance) {
        res.status(404).send("requested resource cannot be found").end();
        return;
      }
      var instance_result = instance.toObject();
      res.render("my_listing.jade",{
        "title": instance_result.listing_related.title,
        "result":instance_result,
        "current_page_url":current_page_url,
        "editing":is_editing,
        "user": req.user,
        "isAuthenticated": req.isAuthenticated()  // req.isAuthenticated() is a method added by passport
      });
  });  
}
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

exports.dbUpdateAttr =function(req, res , next){
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
