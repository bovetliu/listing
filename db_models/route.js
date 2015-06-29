var mongoose = require('mongoose');
var route_schema = new mongoose.Schema({
  origin_lat:{ type:Number, max: 85, min:-85}, 
  origin_lng:{ type:Number, max:180, min:-180},
  destiny_lat:{ type:Number, max: 85, min:-85}, 
  destiny_lng:{ type:Number, max:180, min:-180},
  encoded_polyline:String,

  origin:String,
  destiny:String,
  source:String, // possible original post URL
  memo: String,

  cat:{ type:Number, min:1, max:4},  // [1,2,3]
  isexpired:Boolean,
  post_date: Date,
  depart_date: Date
}, { collection: 'route' });

/* validation area begin*/
var checkNull = function(value) {
  if (typeof (value) == 'undefined' || value == null) return false ;
  else return true;
}
route_schema.path('origin_lat').validate ( checkNull,'cannot be null or undefined');
route_schema.path('origin_lng').validate ( checkNull,'cannot be null or undefined');
route_schema.path('destiny_lat').validate ( checkNull,'cannot be null or undefined');
route_schema.path('destiny_lng').validate ( checkNull,'cannot be null or undefined');
route_schema.path('encoded_polyline').validate ( checkNull,'cannot be null or undefined');
route_schema.path('origin').validate ( checkNull,'cannot be null or undefined');
route_schema.path('destiny').validate ( checkNull,'cannot be null or undefined');
route_schema.path('cat').validate ( checkNull,'cannot be null or undefined');
route_schema.path('isexpired').validate ( checkNull,'cannot be null or undefined');
route_schema.path('depart_date').validate ( checkNull,'cannot be null or undefined');
/* validation area end*/

route_schema.static({  
  list: function(callback) {
    this.find({} , null, {sort:{_id:-1}}, callback);
  }
});

module.exports = mongoose.model('Route',route_schema);
/*
for Route
---
origin_lat:Number,
origin_lng:Number,
destiny_lat:Number,
destiny_lng:Number,
encoded_polyline:String, // using google compressed string representation of polyline,
//json_latlngs deprecated
---
origin: String,
destiny: String,
source: String,
memo:String,
---
cat:Number// min 1, max 4, valid numbers: 1,2,3
isexpired:Boolean,
post_date:Date, // post date
depart_date: Date,
*/