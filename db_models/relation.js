var mongoose = require('mongoose');
var _ = require('underscore');
var relation_schema = new mongoose.Schema({
  "operater_id":{type:mongoose.Schema.ObjectId, ref:'User'},
  "operation_receiver_id" :mongoose.Schema.ObjectId,   
  "operation_name":String, 
  "operation_value": Number
},{ collection:'relation'});

// define instance methods
relation_schema.method({
});

relation_schema.static({
  getRelation: function (operater_id, operation_receiver_id, exec){
    var Model = this;
    Model.findOne({operater_id:operater_id, operation_receiver_id:operation_receiver_id}, exec);
  },
  addRelation: function (relation, exec){
    var Model = this;
    Model.findOne({
      operater_id: relation.operater_id, 
      operation_receiver_id: relation.operation_receiver_id, 
      "operation_name": relation.operation_name
    },
    function (err, db_relation){
      if (err){
        console.log("[ERROR] : " + JSON.stringify(err))
        exec(err, null);
      }
      else if (!db_relation){
        var new_relation = new Model(relation);
        new_relation.save( function (err) {
          if (err) {
            return exec(err, null);
          }
          exec(null,new_relation);
        });
      } 
      else {  // already has one relation, so we cannot process this adding
        exec(new Error("relation already exited or have conflicts with exited relations "));
      }
    });
  }
});


// helper function of schema
var saveCB = function( err, instance){
  if (err) console.log("[! ERROR !]  NOT successfully saved");
  else console.log("[INFO] "+ instance._id +" saved. ");
};

module.exports = mongoose.model('Relation',relation_schema);




/*
Possible relation in databse

{
  operater_id:ObjectId(5611f401ce5001a4267c83d3),
  operation_receiver_id:"1510416050108",
  operation:{
    operation_name:"vote",
    operation_value:+1, or -1
  }
}


{
  operater_id:ObjectId(5611f401ce5001a4267c83d3),
  operation_receiver_id:"1510416050108",
  operation:{
    operation_name:"star",
    operation_value:1
  }
}

*/

