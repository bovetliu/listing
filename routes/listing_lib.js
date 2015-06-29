var express = require('express');
var router = express.Router();
var http = require('http');
var https = require('https');
var current_page_url = (process.env.local)?"http://localhost:3000/":"http://listingtest-u7yhjm.rhcloud.com/";
var port = (process.env.local)? 3000:process.env.OPENSHIFT_NODEJS_PORT; // please be attention here might have problem

// exports.buildOptions = function(id, method){
//   return {id:id,method:method};
// };

// exports.getJSON = function(req, res, next, options ,onResult)
// {   
//   req.db_model.findOne({_id:options.id}, null,{},function(err, instance){  // Payattention, here is Callback
//     if (err) { 
//       console.log(err.message);
//       return next(err);
//     }
//     if(!instance) {
//       console.log("[WARNING] did not find instance in DB at procUpload(): " + req.params.id);
//       return;
//     }

//     instance.addOneImage( filename);  // when enter DB, encode filename
//   }); 
// };



// exports.updateAttr = function(options, attr, value){
//   console.log("rest::updateAttr");
//   var prot = options.port == 443 ? https : http;
//   console.log("[INFO] JSON.stringify(options) in updateAttr:"+JSON.stringify(options));
//   var req = prot.request(options, function(res)
//   {
//     console.log("[INFO] see response of \"post\" update in listing_lib.js: "+res.body);
//   });

//   req.on('error', function(err) {
//       //res.send('error: ' + err.message);
//   });
//   // console.log("attr :"+attr)
//   var temp = {};
//   temp[attr] = value;
//   // console.log("updateAttr: " + JSON.stringify(temp)); 
//   req.write( JSON.stringify( temp));
//   req.end();
// };

exports.renderJade = function( req, res, next, is_editing){
  req.db_model.findOne({_id:req.params.id}, null,{},function(err, instance){
      if (err) { 
        console.log(err.message);
        return next(err);
      }
      if(!instance) {
        res.status(404).send("requested resource cannot be found").end();
        return;
      }
      res.render("my_listing.jade",{
        "result":instance,
        "current_page_url":current_page_url,
        "editing":is_editing
      });
  });  
}
exports.dbUpdateAttr =function(req, res , next){
  req.db_model.update({_id: req.params.id},
    {$set: req.body},
    {safe: true, multi: false}, function(e, result){
    if (e) return next(e)
    console.log("[INFO] dbUpdateAttr result: " + JSON.stringify(result));
    if (result.n <1){ 
      res.status(404).send(result);
      return;
    }
    res.status(200).send(result);
  })
}
