// This is javascript file
$(document).ready(function(){
  // Get the template HTML and remove it from the doumenthe template HTML and remove it from the doument
  page_useful_info = JSON.parse($("meta[name=\"page_useful_info\"]").attr("content"));
  
  var helpers = {
    db_id : page_useful_info.db_id,
    deleteURL:function( filename ){
      return [window.location.origin,"edit", page_useful_info.db_id, filename].join("/");
    },
    updateURL:function(){
      return [window.location.origin,"edit",page_useful_info.db_id].join("/");
    },
    isEditing:function(){
      return page_useful_info.is_editing;
    },
    updateAttr: function( attr, value, onsuccessCB ){
      var to_be_uploaded = {}; to_be_uploaded.attr_path = JSON.stringify(attr.split(".")); to_be_uploaded.value = JSON.stringify(value);
      $.ajax({
        url:[window.location.origin,"edit",page_useful_info.db_id].join("/"),
        data: to_be_uploaded, // plain object   {"attr_path": ["unit_traits","amenities_status"], "value": {"kitchen": true, "internet": true, ...}}
        type: 'POST',
        conntentType:"text/plain",
        crossDomain:true,
        success: function(data, status){ 
          if (!data._id){
            console.log([data,status]);
          } else if (data._id) {
            console.log(data);
            onsuccessCB(attr, value);
          }
          else{
            console.log(data);
          } 
          //EasySubOrg.MAP.cu_01.set('to_be_set_expired',"");    
        },  
      }); // end of $.ajax  
    }
  };
  /*photo_data stores URL towards photos stores on AWS*/
  var photo_data = JSON.parse($("meta[name='photo-data-modal']").attr("content"));   

  var previewTemplate = $("#preview_template").html();
  console.log(previewTemplate);

  // var Dropzone = require("enyo-dropzone");
  Dropzone.autoDiscover = false;
  
   
  var myDropzone = new Dropzone('#dropzone-container', { // Make the whole body a dropzone
    url: "/edit/5593aa9e48f2890a9a0f2929/upload_image", // Set the url
    thumbnailWidth: 120,
    thumbnailHeight: 120,
    parallelUploads: 20,
    previewTemplate: previewTemplate,
    autoQueue: false, // Make sure the files aren't queued until manually added
    // autoProcessQueue:false,
    parallelUploads:2,
    uploadMultiple:true,
    previewsContainer: "#previews", // Define the container to display the previews
    clickable: ".fileinput-button", // Define the element that should be used as click trigger to select files.
    init:function(){
    }
  });
   
  myDropzone.on("addedfile", function(file) {
    // Hookup the start button
    file.previewElement.querySelector(".start").onclick = function() { myDropzone.enqueueFile(file); };
    $(file.previewElement).mouseover(function(){
      $(this).find('.preview-image-container').addClass("blur");
      $(this).find('.preview-image-cover').css("opacity",0.7);
      $(this).find('.preview-info-control').css("opacity",1);
    });
    $(file.previewElement).mouseout(function(){
      $(this).find('.preview-image-container').removeClass("blur");
      $(this).find('.preview-image-cover').css("opacity",0);
      $(this).find('.preview-info-control').css("opacity",0);
    });
    $(file.previewElement).find(".set-cover").click( function(){
      console.log(file);  

      helpers.updateAttr("listing_related.cover_image", file.name, function(data,status){
        console.log("change cover image is a " + status);
      });

      // $.ajax({
      //   url:helpers.updateURL() ,
      //   method:"POST",
      //   data:{"listing_related.cover_image":file.name}
      // }).done(function(data, status) {   //.done is an alternative of success functional attr 
      //   console.log(data); 
      // });
    });
  });

  myDropzone.on("thumbnail", function(file){
    /*The dataUrl can be used to display the thumbnail image*/
    console.log("thumbnail event handler");
    // $(file.previewElement).css("background-image", "url("+dataUrl+")");
    console.log(file);
    var jq_img = $(file.previewElement).find('img');

    jq_img[0].onload = function(){
      var min = this.width < this.height ? this.width : this.height;
      var ratio = 120 / min;

      var width = Math.round( this.width * ratio);
      var height = Math.round(this.height * ratio);
      console.log([Math.round((120-height)/2).toString()+"px" , Math.round((120-width)/2).toString()+"px" ]);
      var offsetTop = Math.round((120-height)/2).toString()+"px" ;
      var offsetLeft = Math.round((120-width)/2).toString()+"px" 
      jq_img.css({
          position:"absolute",
          width: width + "px",
          height: height + "px",
          top: offsetTop,
          left:  offsetLeft
      });
    }
  })

  // Update the total progress bar
  myDropzone.on("totaluploadprogress", function(progress) {
    document.querySelector("#total-progress .progress-bar").style.width = progress + "%";
  });
   
  myDropzone.on("sending", function(file) {
    // Show the total progress bar when upload starts
    document.querySelector("#total-progress").style.opacity = "1";
    // And disable the start button
    file.previewElement.querySelector(".start").setAttribute("disabled", "disabled");
  });
  
  myDropzone.on("removedfile", function(file){

    if (file.xhr && file.xhr.responseText){  // remove files uploaded at this time
      console.log(file)
      var resJSON = JSON.parse( file.xhr.responseText );
      console.log(JSON.parse( file.xhr.responseText ));
      console.log("asDFASFDSAsdaf: " + JSON.stringify( resJSON[file.name] ));

      var request_target_url = [window.location.origin,"edit",resJSON[file.name].db_id,resJSON[file.name].filename].join("/")
      console.log(request_target_url);
      $.ajax({
        url: request_target_url,
        method:"DELETE"
      }).done(function(data, status) {   //.done is an alternative of success functional attr 
        console.log(data); 
      });
    }
    else{  // remove those already uploaded files
      // console.log(file.removeURl);
      $.ajax({
        url: file.removeURl,
        method:"DELETE"
      }).done(function(data, status) {   //.done is an alternative of success functional attr 
        console.log(data); 
      });
    }
  });

  // Hide the total progress bar when nothing's uploading anymore
  myDropzone.on("queuecomplete", function(progress) {
    document.querySelector("#total-progress").style.opacity = "0";
  });
   
  /*adding mock file*/
  $.each(photo_data, function( index, value){
    // console.log(value);
    var filename = value.thumb.split("/").pop();
    var mockFile = {
      name: filename,
      size:12345,
      removeURl:helpers.deleteURL(filename)
    }
    myDropzone.emit("addedfile", mockFile);
    myDropzone.emit("thumbnail", mockFile, value.thumb);
    myDropzone.emit("success", mockFile);
  })
   
  
  // Setup the buttons for all transfers
  // The "add files" button doesn't need to be setup because the config
  // `clickable` has already been specified.
  document.querySelector("#actions .start").onclick = function() {
    myDropzone.enqueueFiles(myDropzone.getFilesWithStatus(Dropzone.ADDED));
  };
  document.querySelector("#actions .cancel").onclick = function() {
    myDropzone.removeAllFiles(true);
  };

  // $('#template').css("background-image","url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAgAElEQVR4Xuy9B5wd133f+51y+73bO9qid4AAQQgAO0VSlEVGlhU1x5Yd2XFJnlvynJc4dp6fS5IXyyW2o8R6ieVIliWZklUoSrJkkWAnSKITvSwWu9je7t69bWo+58yce2cXFwswcd5LPp83Eri7c+eeOXP+/ff/n/9ov/aVq77pa4jDB1xN/Bd83cDzfXTfQ3yqaRq+H3wWPXRdv+lc/URwved5tVPqenVOjCv+Lb1umUEjHwXfW3wsnmN0/Juu9P3aM6l5uW59roax3LOpe9+8JurZGiyXnIJ6XjUf36/fU51T1zRa80Zrs/i6+rpo/+dXr/nYbvAdcd405K9xz8E0Taq+huv7kkjLE7Phbe+MTv/NVy0l8M2L/U6HjhIl5LtbDHF7AgfEXMwkjQjW6D7R65YyxHICExCxfmi/8Y1rvqGZJA0dq7yAoemSkIk4xOMxypaH7TjYto1FDNvXFQ+gi2vdQLIdPeDCYLKhRmjAme90wZde72mBphGHcQf0FLMKFVRtqEbfcxspg2XuowjgC80WftcMnztKAEUcRWghrXUmuoMHaLBg6t5i7KUaMXq5uE773OFrPkYS3a2SNDRJIdt2KPixQGpDFSoGs1ydku0yZwXElJ+bAUF1pz5ZxZF3ql7eCdGlrgkX9E4IHL1e3edvk8CC4UKuZnkCK6avr9Pfxvosp8olgb/48pBfsGPEdZ+44VPxXFzHxQklMxXT0EKWMwyDqqfje7bknHKlyoIfk9LtkpDrF7UnS1XLOyHkra79n5nAunezRDYiwDu1r7dai+XUuBJA7TMvDPmeFzgbvudjezq2Dp7lSGdAfKbrGoK4juOg6wamaVCtVOXn8ViMkmtjWSYWwiET/7v9oVSisPi3+oZYLikhUZvi+bXxPT34UElkowd2agpdMF9AACVpPj6h93GT49PwCXwIPBThjN58hSJwjYAN5q/7S61kfV63X7Wbr7gds2h/+NfX/JgZkw8o1LHnuQHBHE0SXEhqXeWC67nyOrFYiUQCz3YlQ4j/WNK+1AmwnFOmFkiLEGzp9BsROMoQinhRlbv0gaMEVp8pQojx/ZBJ7khd3obANcYJGanR/BsRODrnO5pHlOFD4tzqe9onv3XNF95ycBMN262HNsLGNgpj3Ihj6EX/kCrar33Hx74lUyoCRx/YD8OSqJOyVOocX9w8EB+1oIqRxLX2Eseu0YJGr1fj1xiuQdh2J7b+zqXPqYuwLx0Y0Jza16UmDdfwtmNKUgVjaHqgi3yvvj7y/O88OyAJLBZV/sOoqatARd8co1m+UmxirrGG85Bx8x0QWKq80HQplRvlxqUEdjFqXqgicFQCohIr1XdkfDXRRmotqnKXfv63SmBNrF34wP+9BBaM7odGQzGJ/DsSB3/y24OCZaQqFvZV2FxhE8UUHFfYXKGiFwMR9UUU5w05XxUqSO2kxhcPE/07wgqKbaL85qj4IWrfwrWo2T5JstD2huNFGSKAZepHNApVnwgAZymx3Qa2WoSB4tBvhVgsYe2oKbul9N0BgW8rufXZKxbG9wNtqQmJjgTW2p88N+xnNVuCGoKYRhjPKnRLRD9LfUM/)");
  $.each( $('.preview-container'), function(index, element){
    $(element).mouseover(function(){
      $(this).find('.preview-image-container').addClass("blur");
      $(this).find('.preview-image-cover').css("opacity",0.7);
      $(this).find('.preview-info-control').css("opacity",1);
    });
    $(element).mouseout(function(){
      $(this).find('.preview-image-container').removeClass("blur");
      $(this).find('.preview-image-cover').css("opacity",0);
      $(this).find('.preview-info-control').css("opacity",0);
    });
  });
}); // end of read();