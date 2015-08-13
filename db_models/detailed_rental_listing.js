var mongoose = require('mongoose');
var _ = require('underscore');
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
      }
  },
  "user_behavior": {
      "cat": Number,
      "target_whole_unit": Boolean,
      "target_single_room": Boolean,
      "target_shared_place":Boolean
  },
  "listing_related": {
      "title": String,
      "about_this_listing": String,
      "isexpired": Boolean,
      "post_date": Date,
      "cover_image":String,
      "images":Array,
      "simplified_rental_data_id":mongoose.Schema.ObjectId,
      "availability": {
        "begin":Number,
        "end":Number
      },
      "optional_traits_switch":{
        "unit_traits_description":Boolean,
        "unit_traits_house_rules":Boolean,
        "unit_traits_safety_features":Boolean
      }
  }
}, { collection: 'detailed_rental_listing' }
);
var saveCB = function( err, instance){
  if (err) console.log("[! ERROR !]  NOT successfully saved");
  else console.log("[INFO] "+ instance._id +" saved. ");
};

detailed_rental_listing_schema.method({
  addOneImage:function( filename){
    if (!filename) {
      console.log("detailed_rental_listing instance addOneImage method: addOneImage, receives false data, will do nothing")
      return;
    }
    this.listing_related.images.push(filename);
    this.listing_related.images = _.uniq(this.listing_related.images);
    console.log("[debug] check result of this.listing_related.images: " + JSON.stringify(this.listing_related.images) + " sentIn filename: " + filename);
    this.save( saveCB);
  },
  deleteOneImage:function( filename){
    if (!filename) {
      console.log("detailed_rental_listing instance deleteOneImage method: addOneImage, receives false data, will do nothing")
      return;
    }
    var target_index = this.listing_related.images.indexOf(filename);
    if (target_index > -1){
      this.listing_related.images.splice(target_index,1);
      if (filename == this.listing_related.cover_image){ 
        this.listing_related.cover_image="";
        console.log("[INFO] the cover image of instance: " + this._id + " will be deleted, if updating successfully!");
      }
      this.save( saveCB)
    }
    else{
      console.log("[WARNING] instnace does not have provided file named: " + filename );
    }
  }
});
/* static method*/

/* validation area end*/
module.exports = mongoose.model('DetailedRentalListing',detailed_rental_listing_schema);