var express = require('express');
var router = express.Router();

/**req.db_model = db_models.DetailedRentalListing;
   Common prefix of paths is "/data_api"
*/
/* refer to espi, how to write a api. */

/*helper functions*/
/*This function try to devide origin_lat_lb  ->  ['origin_lat', 'lb']  lat_lb -> ['lat','lb']*/
var specialSplit = function (key) {
  key = key.split('_');

  if (key.length >2) {
    return [key.slice(0,-1).join('_'),key[key.length-1]]
  }
  else return key;

}

var genQuery = function (  query_object ){
  var query = {};
  //console.log(query_object );
  Object.keys(query_object).forEach( function (key, index, array) {
    
    var temp = specialSplit (key) ; //   // specialSplit("lat_lb")  == ['lab','lb']
    //console.log(temp );
    if (temp.length == 2 && temp[0] != "") {  // avoid "_id" enter this 
      var attr = temp[0];
      //console.log(temp);
      var decoration = (temp[1] == "hb")?"$lte":"$gte";
      if ( typeof(query[attr]) == 'undefined') query[attr] = {};
      query[attr][decoration] = query_object[key];
    }
    else {
      if ( key =="cat") query[key] =  parseInt(query_object[key] );
      else if ( query_object[key] =="false" ) {
        query[key] = false;
      }
      else if ( query_object[key] =="true" ) {
        query[key] = true;
      }
      else {
        query[key] = query_object[key] ; 
      }
      
    }
  }); 
  console.log(query);
  return query;
}

/*useful routes: 
  1./listing/conditional?[query]
  2./listing_core/considtion?[query]
  3./listing/:id               
*/

router.get('/', function(req, res, next) {
  res.send("API Usage: [document.origin]/data_api/listing/conditional?unit_traits.lat_lb=30&unit_traits.lat_hb=31");
});

router.get('/listing/conditional',function(req, res, next){ 
                  // query              ,fields,options, callback
  req.db_model.find( genQuery(req.query),null , {}, function(error, results) {
    if (error) return next(error);
    if (results == null) res.send([]);
    else res.send( results);    
  });
});

router.get('/listing_core/conditional',function(req, res, next){ 
                  // query              ,fields,               options, callback
  var selected_field = {
    "unit_traits.lat":1,
    "unit_traits.lng":1,
    "unit_traits.price_single": 1,
    "unit_traits.price_total": 1,
    "unit_traits.community": 1,
    "unit_traits.addr": 1,
    "unit_traits.beds": 1,
    "unit_traits.baths": 1,
    "unit_traits.property_type": 1,
    "unit_traits.pet_friendly": 1,
    "user_behavior":1,
    "listing_related":1
  };
  //{"unit_traits.lat":1, "unit_traits.lng":1}
  req.db_model.find( genQuery(req.query),selected_field, {}, function(error, results) {
    if (error) return next(error);
    if (results == null) res.send([]);
    else res.send( results);    
  });
});

router.get('/listing/:id', function (req, res, next){
  req.db_model.findOne({_id:req.params.id}, null,{},function(err, instance){
      if (err) { 
        console.log(err.message);
        return next(err);
      }
      if(!instance) {
        res.status(404).send("listing API 404: resource cannot be found").end();
        return;
      }
      res.send(instance.toObject());
  });
});






module.exports = router;
