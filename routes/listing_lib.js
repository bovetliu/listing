var express = require('express');
var router = express.Router();
var http = require('http');
var https = require('https');
var _ = require('underscore');
var current_page_url = (process.env.local)?"http://localhost:3000/":"http://listingtest-u7yhjm.rhcloud.com/";
var port = (process.env.local)? 3000:process.env.OPENSHIFT_NODEJS_PORT; // please be attention here might have problem


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
        "result":instance.toObject(),
        "current_page_url":current_page_url,
        "editing":is_editing
      });
      // _.each( instance.toObject().unit_traits.amenities_status, function( element, index, list) {
      //   if (list.hasOwnProperty(index)){
      //     console.log(element);
      //   }
      // });

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
