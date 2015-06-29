var mongoose = require('mongoose');
var detailed_rental_listing_schema = new mongoose.Schema({
  "unit_traits": {
      "lat": { type:Number, max: 85, min:-85},
      "lng": { type:Number, max:180, min:-180},
      "price_single": {type:Number, min:0},
      "price_total": {type:Number, min:0},
      "community": String,
      "addr": String,
      "beds": {type:Number, min:0, max:20},
      "baths": {type:Number, min:0, max:20},
      "property_type": String,
      "pet_friendly": Boolean,
      "amenities_status":                
      {
        "kitchen":Boolean,
        "internet":Boolean,
        "tv":Boolean,
        "essentials":Boolean,
        "shampoo":Boolean,
        "heating":Boolean,
        "air_conditiong":Boolean,
        "washer":Boolean,
        "dryer":Boolean,
        "free_parking_on_premises":Boolean,
        "wireless_internet":Boolean,
        "cable_tv":Boolean,
        "breakfast":Boolean,
        "pets_allowed":Boolean,
        "family/kid_friendly":Boolean,
        "suitable_for_events":Boolean,
        "smoking_allowed":Boolean,
        "wheelchair_accessible":Boolean,
        "elevator_in_building":Boolean,
        "indoor_fireplace":Boolean,
        "buzzer/wireless_interoom":Boolean,
        "doorman":Boolean,
        "pool":Boolean,
        "hot_tub":Boolean,
        "gym":Boolean
      },
      "description": Array,
      "house_rules": String,
      "safety_features": {
          "smoke_detector": Boolean,
          "carbon_monoxide_detector": Boolean,
          "first_aid_kit": Boolean,
          "safety_card": Boolean,
          "fire_extinguisher": Boolean
      },
      "availability": String
  },
  "user_behavior": {
      "cat": Number,
      "target_whole_unit": Boolean,
      "target_single_room": Boolean
  },
  "listing_related": {
      "title": String,
      "about_this_listing": String,
      "isexpired": Boolean,
      "post_date": Date,
      "cover_image":String,
      "images":Array,
      "simplified_rental_data_id":mongoose.Schema.ObjectId,
      "optional_traits_switch":{
        "unit_traits.description":Boolean,
        "unit_traits.house_rules":Boolean,
        "unit_traits.safety_features":Boolean
      }
  }
}, { collection: 'detailed_rental_listing' }
);

/* validation area begin */
/*
rental_point_schema.path('community').validate( function(value){
  return value.length <= 120;
},"too many chars in community attr");
*/
/* validation area end*/


module.exports = mongoose.model('DetailedRentalListing',detailed_rental_listing_schema);