//this page defines the schema for RentalPoint  db model
var mongoose = require('mongoose');
var rental_point_schema = new mongoose.Schema({
  lat:{ type:Number, max: 85, min:-85} , 
  lng:{ type:Number, max:180, min:-180},
  beds: {type:Number, min:0, max:20},
  baths:{type:Number, min:0, max:20},
  price_single: {type:Number, min:0},
  price_total : {type:Number, min:0},
  cat:{type:Number, min:1,max:4}, // 1 : sublease, 2:want to lease, 3: find roommate(includes finding colease)   
  post_date: Date,
  isexpired:Boolean,
  community:String,
  source:String,
  memo:String,
  addr:String
}, { collection: 'rentalpoint' }
);

/* validation area begin */
/*
rental_point_schema.path('community').validate( function(value){
  return value.length <= 120;
},"too many chars in community attr");
*/
/* validation area end*/

rental_point_schema.static({  
  list: function(callback) {
    this.find({} , null, {sort:{_id:-1}}, callback);
  }
});

module.exports = mongoose.model('RentalPoint',rental_point_schema);
/*
for RentalPoint
----
_id:number
lat: number
lng: number
----
beds:number
baths:number
----
price_single_room:number
price_total:number
----
cat:number // 1 : sublease, 2:want to lease, 3: find roommate(includes finding colease)  
post_date: date
isexpired:  boolean
---
community: string
source: url_string
memo: string  // content at original post
addr:string
*/