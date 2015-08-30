/*routes/s3lib.js  of reverse_airbnb */
var aws = require('aws-sdk');
var fs = require('fs');
var listing_lib = require('./listing_lib.js');  // find at local path
var _ = require('underscore');
if (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY){
  console.log("[INFO] s3lib.js has been using environmental keys");
} else console.log("[WARNING]: s3lib.js does not find environmental keys for AWS, might encounter image uploading technical failure ");

/*db*/


var AWS_ACCESS_KEY =  process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY =  process.env.AWS_SECRET_KEY;

// console.log( AWS_ACCESS_KEY +"  " +  AWS_SECRET_KEY);
var S3_BUCKET = 'esimgserver';
aws.config.update({accessKeyId: AWS_ACCESS_KEY , secretAccessKey: AWS_SECRET_KEY });
aws.config.update({region: 'us-west-2' , signatureVersion: 'v4' });
var photoBucket = new aws.S3({   // This is actually one instance of S3, initialized with param:{Bucket:'esimgserver'}
  params: {Bucket: 'esimgserver'}
});

// programmer help information, If you have something unclear about AWS s3 javascript for Node.js,
//please go to http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html  to see the API reference

//local helper functions
var uploadToS3 = function (file, destFileName, callback){
  photoBucket.upload(
    {
      ACL: 'public-read', //Access Control List status
      Body: fs.createReadStream(file.path), 
      Key: destFileName.toString(), // This is the path generated by procUploaded function
      ContentType: 'application/octet-stream' // force download if it's accessed as a top location
    },
    callback // callback should take err, data, these two params
  );
}; // end of uploadToS3

var verifyFileName = function (filename){
  var pattern = /^[-\w^&'@{}[\],$=!#().%+~ ]+$/;
  if (filename.match(pattern) )return true;
  else return false;
}

//exported functions, mainly are router handles
var to_be_exported = {


  //context : app.delete('/edit/:id/:filename', s3lib.procDeleteObject);
  procDeleteObject:function(req, res, next){
    var file_path_in_bucket = req.params.id+"/"+req.params.filename;
    console.log("[INFO]file_path_in_bucket"+file_path_in_bucket);

    /*updating Database*/
    req.DB_Listing.findOne({_id:req.params.id}, null,{},function(err, instance){
      if (err) { 
        console.log(err.message);
        return next(err);
      }
      if(!instance) {
        console.log("[WARNING] did not find instance in procDeleteObject(): " + req.params.id);
      }
      instance.deleteOneImage(req.params.filename);
    });

    /*updating cloud side*/
    photoBucket.deleteObject( {Key:file_path_in_bucket}, function(err, data){
      if (err){
        console.error(err);
        //following method of handling file delete failure is not good, I will try implementing one better one.
        var failuremsg = JSON.stringify({
          operation:"delete",
          file_path_in_bucket:file_path_in_bucket,
          status:"failure"
        })
        return res.status(500).send(failuremsg);
      }
      console.log(["[INFO]File deleted from S3: ", file_path_in_bucket].join(""));
      res.status(200).send({operation:"delete",file_path_in_bucket:file_path_in_bucket, status:"success"}).end();
      //I might not need to send new response, 
    });
  },
  /* for programmer's reference*/
  /*  one typical file object is like this:

    { 
      fieldname: 'file',
      originalname: 'test11.png',
      name: 'e8a2bc8c1b0aba7a62d3ff2fe46b49e3.png',
      encoding: '7bit',
      mimetype: 'image/png',
      path: '/tmp/e8a2bc8c1b0aba7a62d3ff2fe46b49e3.png',
      extension: 'png',
      size: 1109683,
      truncated: false,
      buffer: null 
    }
  */
  /* comes from app.post('/edit/:id/upload_image',multer(), s3lib.procUpload); */
  procUpload:function(req, res, next){
    // console.log("[INFO 117]"+req.body);
    console.log(JSON.stringify(req.files));  

    // if uploading multiple files in the request, the  req.files = { "file[0]": fileObject0, "file[1]": fileObject1}
    var file_number = _.size(req.files);
    if (!req.files ) {  // the reason I have req.files should thanks to multer
        return res.status(403).send('expect files').end();
    }
    else{
      console.log("[INFO] this request contains " + file_number +" files");
    }
    if (file_number  >0){  // processing multiple files in one request situation
      var multiple_upload_success_msg={};
      var target_number = file_number -1;
      var cnt = -1;
      _.each( req.files,function(fileobject, key, ar){  // key is like "file[0]"  "file[1]""
        
        if (!/^image\/(jpe?g|png|gif)$/i.test(fileobject.mimetype)) {
          return res.status(500).send('expect image file').end();
        }
        else if (! verifyFileName(fileobject.originalname) ){
          
          return res.status(500).send('illegal chars').end();
        }
        var filename = fileobject.originalname;
        if (req.params.id) var filepath = req.params.id+'/' + filename;
        else var filepath =  filename;
        console.log("filepath:"+filepath); 

        uploadToS3(fileobject, filepath, function (err, data) {
          cnt = cnt + 1;
          // console.log("uploadToS3 callback one time with cnt: " + cnt)
          if (err) {
              console.error(err);
              return res.status(500).send('failed to upload to s3').end();
          }

          req.DB_Listing.findOne({_id:req.params.id}, null,{},function(err, instance){  // Payattention, here is Callback
            if (err) { 
              console.log(err.message);
              return next(err);
            }
            if(!instance) {
              console.log("[WARNING] did not find instance in DB at procUpload(): " + req.params.id);
              return;
            }

            instance.addOneImage( filename);  // when enter DB, encode filename
          });   

          var success_msg = {
            url:data.Location,
            db_id:req.params.id || "dropzone",
            filename: filename,
            operation:"upload",
            msg_source:"callback of uploadToS3()  of s3lib.js"
          };
          multiple_upload_success_msg[filename] = success_msg;
          if (cnt == target_number){  // although callback will be called multiple times, there is only one server response
            // console.log("check output:");
            // console.log(JSON.stringify(multiple_upload_success_msg));
            res.status(200).send(multiple_upload_success_msg).end();
          }

        }); // end of uploadToS3 callback and function itself
      }); // end of _.each

    }// end of multiple submit condition
  }//end of procUpload function delaration
}
module.exports = to_be_exported;