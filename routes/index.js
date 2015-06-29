require('mongoose');
//req.db_model
/*This function try to devide origin_lat_lb  ->  ['origin_lat', 'lb']  lat_lb -> ['lat','lb']*/
var specialSplit = function (key) {
  key = key.split('_');

  if (key.length >2) {
    return [key.slice(0,-1).join('_'),key[key.length-1]]
  }
  else return key;

}

var genQuery = function (  request_object ){
  var query = {};
  //console.log(request_object );
  Object.keys(request_object).forEach( function (key, index, array) {
    
    var temp = specialSplit (key) ; //   // specialSplit("lat_lb")  == ['lab','lb']
    //console.log(temp );
    if (temp.length == 2 && temp[0] != "") {  // avoid "_id" enter this 
      var attr = temp[0];
      //console.log(temp);
      var decoration = (temp[1] == "hb")?"$lte":"$gte";
      if ( typeof(query[attr]) == 'undefined') query[attr] = {};
      query[attr][decoration] = request_object[key];
    }
    else {
      if ( key =="cat") query[key] =  parseInt(request_object[key] );
      else if ( request_object[key] =="false" ) {
        query[key] = false;
      }
      else if ( request_object[key] =="true" ) {
        query[key] = true;
      }
      else {
        query[key] = request_object[key] ; 
      }
      
    }
  }); 
  //console.log(query);
  return query;
}


exports.adaptiveGet = function(req, res, next){ //at app.js this routes.index function
  //console.log(req);
  req.db_model.find( genQuery(req.query),null , {}, function(error, results) {
    if (error) return next(error);
    if (results == null) res.send([]);
    else res.send( results);    
  });
};
