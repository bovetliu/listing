var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('template.jade', {"similar_listing":"similar_listing 1 2 3"});
});


  // req.db_model.findOne({_id:req.params.id}, null,{},function(err, instance){
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

  req.db_model.findOne({_id: "5593aa9e48f2890a9a0f2929"}, null,{},function(err, instance){
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
      });
  }); 
})
module.exports = router;
