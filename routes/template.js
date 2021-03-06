var express = require('express');
var router = express.Router();

function processReqUser ( req_user){  
  if (req_user) var temp_user = req_user.toObject();
  else return null;
  delete temp_user.password_hash; 
  return temp_user;
}
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('template.jade', {"similar_listing":"similar_listing 1 2 3"});
});


  // req.DB_Listing.findOne({_id:req.params.id}, null,{},function(err, instance){
  //     if (err) { 
  //       console.log(err.message);
  //       return next(err);
  //     }
  //     if(!instance) {
  //       res.status(404).send("requested resource cannot be found").end();
  //       return;
  //     }
  //     res.render("my_listing.jade",{
  //       "result":instance.toObject(),
  //       "current_page_url":current_page_url,
  //       "editing":is_editing
  //     });
  //     // _.each( instance.toObject().unit_traits.amenities_status, function( element, index, list) {
  //     //   if (list.hasOwnProperty(index)){
  //     //     console.log(element);
  //     //   }
  //     // });

  // }); 

router.get('/dropzone', function(req, res, next){

  req.DB_Listing.findOne({_id: "5593aa9e48f2890a9a0f2929"}, null,{},function(err, instance){
      if (err) { 
        console.log(err.message);
        return next(err);
      }
      if(!instance) {
        res.status(404).send("requested resource cannot be found").end();
        return;
      }
      res.render("dropzone.jade",{
        "result":instance.toObject(),
        "user": processReqUser(req.user),
        "isAuthenticated": req.isAuthenticated()  // req.isAuthenticated() is a method added by passport
      });
  }); 
})

router.get('/dropzone_online', function(req, res, next){
  req.DB_Listing.findOne({_id: "55910d94008d84ed2912e1ae"}, null,{},function(err, instance){
      if (err) { 
        console.log(err.message);
        return next(err);
      }
      if(!instance) {
        res.status(404).send("requested resource cannot be found").end();
        return;
      }
      res.render("dropzone.jade",{
        "result":instance.toObject(),
        "user": processReqUser(req.user),
        "isAuthenticated": req.isAuthenticated()  // req.isAuthenticated() is a method added by passport
      });
  }); 
})
module.exports = router;
