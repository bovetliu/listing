// This is javascript file, this script will be run in client side
//gloabl variabl Galleria is reserved word
$(document).ready(function(){
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
    }
  };

  /*prepare map*/
  var neighborhood_data = JSON.parse($("#neighborhood-data").attr("content")); 
  var map_options ={ draggingCursor:"move",draggableCursor:"auto" , zoom: 14,scrollwheel: false, center: new google.maps.LatLng(neighborhood_data.lat, neighborhood_data.lng) };
  var map = new google.maps.Map(  $('#map-div')[0], map_options ); 
  

  /*photo_data stores URL towards photos stores on AWS*/
  var photo_data = JSON.parse($("meta[name='photo-data-modal']").attr("content"));   
  var galleria_control = new (Backbone.Model.extend({
    b_Galleria_started:false,  
    launchGalleria: function(){
      if (Galleria) {
        console.log("Launch Galleria");
        Galleria.loadTheme('/plugins/galleria/themes/classic/galleria.classic.min.js');
        Galleria.run('.galleria',{
          dataSource:photo_data
        });   
      }
      else {
        console.log("Galleria not working")
      }
    },
    initialize:function(){
      console.log("init of GalleriaControl()");
      var ClassRef = this;
      $("#cover-img").click(function(){
        console.log("#cover-img clicked");
        if (!ClassRef.get("b_Galleria_started")){
          ClassRef.launchGalleria();
          ClassRef.set("b_Galleria_started",true);
          $(this).unbind("click"); // prevent this event from happening again, saving computing resource
        }
      });
    }
  }))();

  // if editing, do something with dropzone
  if (helpers.isEditing()) {
    // start Dropzone
    // console.log(Dropzone.options)
    var previewTemplate = $("#preview_template").html();
    //console.log(previewTemplate);

    // var Dropzone = require("enyo-dropzone");
    Dropzone.autoDiscover = false;
    var myDropzone = new Dropzone('#dropzone-container', { // Make the whole body a dropzone
      url: "./"+ helpers.db_id +"/upload_image", // Set the url
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
      $(file.previewElement).find(".set-cover").click(function(){
        console.log(file);  

        $.ajax({
          url:helpers.updateURL() ,
          method:"POST",
          data:{"listing_related.cover_image":file.name}
        }).done(function(data, status) {   //.done is an alternative of success functional attr 
          console.log(data); 
        });
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
    myDropzone.on("error", function(file){
      if(!file.accepted) this.removeFile(file);
    });
    myDropzone.on("success", function(file){
   //   console.log("success event handler");
  //    console.log(file);
    }); 
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
    })
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
      myDropzone.processQueue();
    };
    document.querySelector("#actions .cancel").onclick = function() {
      myDropzone.removeAllFiles(true);
    };

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

  }
  

  // add logic to .expandable
  _.each($(".expandable"), function(dom,index,list){
    var full_div = $(dom).find('.expandable-content-full');
    full_div.hide();
    $(dom).find('a.expandable-trigger-more').click( function(){
      console.log("clicked");
      $(dom).addClass('expanded');
      $(dom).find('.expandable-content-summary').hide();
      full_div.show();
    });
  });  

  // instance: book_panel_01, class BookPanel
  var BookPanel = Backbone.View.extend({
    // it has model
    el:'#book_it_form',
    css_status:"initial",
    book_it_elem : document.getElementById("book_it"),
    setStatus:function( status){
      var ClassRef = this;
      switch(status){
        case "initial" :
          if (ClassRef.css_status!= "initial") {
            ClassRef.$('#pricing,#book_it').removeClass("fixed")
            $('#subnav-container').hide();
            $('#subnav-container').removeClass("FixedAtTop")
            this.css_status = status;
          }
          break;

        case "fixed" :
          if (ClassRef.css_status != "fixed") {

            ClassRef.$('#pricing,#book_it').addClass("fixed");
            this.$("#book_it").removeClass("bottom");
            
            if (this.book_it_elem.style.removeProperty) {
                this.book_it_elem.style.removeProperty('top');
            } else {
                this.book_it_elem.style.removeAttribute('top');
            }

            $('#subnav-container').addClass("FixedAtTop");
            $('#subnav-container').show();
            this.css_status = status;

          }
          break;

        case "bottom":
          if (this.css_status != "bottom") {
            console.log("This is will be handled later");
            this.$("#book_it").addClass("bottom");
            // this.$("#book_it").css({top:0});
            this.$("#book_it").css({top:ClassRef.model.get("higher_bound_of_top") - ClassRef.model.get("summary_top") + $('#my-nav').height()});
            this.css_status = status;
          }
          break;
        default:
          console.log("encountered default, debug book_panel class or its instance: book_panel_01")
          break;
      }
    }, // end of setStatus
    initialize:function(){
      $('#subnav-container').hide();
      this.setStatus("initial");
    }
  });

  var higher_bound_of_top = $('#details').height()  + $('#summary').height() + $('#photos').height() + $('#my-nav').height() - $("#pricing").height() - $("#book_it").height();
  var summary_top =  $('#photos').height() + $('#my-nav').height() ;
  console.log(higher_bound_of_top);

  var book_panel_01 = new BookPanel( 
    { model: new Backbone.Model({ 
      "higher_bound_of_top":higher_bound_of_top,
      "summary_top":summary_top
      })
    }
  );
  $(window).scroll(function(){

    if ($(this).scrollTop() <=408 ) {
      console.log("scrollTop <= 408")
      book_panel_01.setStatus("initial")
    }     
    else if ($(this).scrollTop() >408 &&  $(this).scrollTop()  < higher_bound_of_top){
      console.log(">448");
      book_panel_01.setStatus("fixed")

    }else if ($(this).scrollTop() >= higher_bound_of_top) {
      console.log("bottom")
      book_panel_01.setStatus("bottom");
    }
  });

  /*editable */
  var editables_controler = new (Backbone.Model.extend({
    defaults:{
      options:{
        "unit_traits.beds":[1,2,3,4,5,6],
        "unit_traits.baths":[1,1.5,2,2.5,3,3.5,4,4.5,5,6],
        "unit_traits.property_type":["apartment","house","duplex"],
        "unit_traits.pet_friendly":[true,false]
      } 
    },
    apiServerURL:  "http://localhost:3000",
    db_id:"123",

    mapOptionsIntoHTML:_.template(
      '<div style="display:inline-block"> \
        <select class="form-control cancel-padding-tb"> \
        <% _.each(options, function(element, index, array){%> \
          <option <%if (selected == element.toString()){%> selected <%}%>  value="<%= element%>"><%=element%></option>\
        <%}); %>\
        </select> \
      </div>'),

    ppForHTML:function(text){
      return text.replace(/\r?\n/g, '\n<br>')
    },
    escapeHTML:function(text){
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    updateAttr: function( attr, value, onsuccessCB ){
      var ClassRef = this;
      // var generated_URL = [ClassRef.get("apiServerURL") , "eidt",ClassRef.get("db_id")].join("/");
      var to_be_uploaded = {}; to_be_uploaded.attr_path = JSON.stringify(attr.split(".")); to_be_uploaded.value = JSON.stringify(value);
      $.ajax({
        url:helpers.updateURL(),
        data: to_be_uploaded, // plain object   {"attr_path": ["unit_traits","amenities_status"], "value": {"kitchen": true, "internet": true, ...}}
        type: 'POST',
        // dataType:"json",
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
    },
    addRightIconField:function(DOMobject, font_awesome_icon_id){
      var ClassRef = this;

      $(DOMobject).append('<span class="edit-field edit-button" style="opacity: 0;"> <i class="fa '+font_awesome_icon_id+'"></i><span>');
      var temp_button = $(DOMobject).find('.edit-button');
      $(DOMobject).mouseenter(function(){
        temp_button.css("opacity",1);
      }).mouseleave(function(){
        temp_button.css("opacity",0);
      });
    },
    addEditField:function( DOMobject){
      this.addRightIconField(DOMobject, "fa-pencil");
    },
    processEditable:function(DOMobject){
      var ClassRef =this;
      var DOMobject_bf = $(DOMobject).clone()[0];
      var JQ_parent = $(DOMobject).parent();

      var save_btn = $('<button  class="btn btn-primary margin-left-right-1x margin-top-1x margin-bottom-1x">Save</button>');
      var cancel_btn =$('<button  class="btn btn-default margin-top-1x margin-bottom-1x">Cancel</button>');
      var row = 1+Math.round($(DOMobject).height() / parseInt($(DOMobject).css("line-height")));
      var col = 20 + Math.round( $(DOMobject).width() / parseInt($(DOMobject).css("font-size")) )
      var text_area_edit =$('<textarea class="block-it margin-top-1x" rows="'+row.toString()+'" cols="'+col.toString()+'">'+$(DOMobject).text()+'</textarea>');
      save_btn.click(function(){
        console.log($(DOMobject).attr('data-dbtarget'));
        ClassRef.updateAttr(
          $(DOMobject).attr('data-dbtarget').toString(), 
          ClassRef.escapeHTML(text_area_edit.val()), 
          function(attr, value){  // in updateAttr declaration, this cb will be taken these two params
            $(DOMobject_bf).html( ClassRef.ppForHTML(value)) ;
            JQ_parent.empty();
            JQ_parent.append(DOMobject_bf);
            $(DOMobject_bf).click(function(){
              ClassRef.processEditable(DOMobject_bf);
            });
            ClassRef.addEditField(DOMobject_bf);
          }
        );// end of invoking updateAttr
      }); 

      cancel_btn.click(function(){
        $(DOMobject_bf).text($(DOMobject_bf).text()) ;
        JQ_parent.empty();
        JQ_parent.append(DOMobject_bf);
        $(DOMobject_bf).click(function(){
          ClassRef.processEditable(DOMobject_bf);
        });
        ClassRef.addEditField(DOMobject_bf);
      }); 

      JQ_parent.empty();
      JQ_parent.append(text_area_edit,save_btn,cancel_btn);
    },
    addSelectField:function(DOMobject){
      this.addRightIconField(DOMobject, "fa-bars");
    },
    processSelectable:function (DOMobject){
      var ClassRef = this; //var DOMobject_bf = $(DOMobject).clone()[0]; 
      $(DOMobject).html($(DOMobject).text().trim());
      console.log(DOMobject);
      // var JQ_parent = $(DOMobject).parent();
      // console.log( ClassRef.get("options"));
      var text = $(DOMobject).text();
      var jq_select_container = $(ClassRef.mapOptionsIntoHTML({
        options:ClassRef.get("options")[$(DOMobject).attr("data-dbtarget")],
        selected: $(DOMobject).text()
      }));
      $(DOMobject).replaceWith( jq_select_container);
      jq_select_container.change(function(){
        // console.log(jq_select_container.find("select").val());
        ClassRef.updateAttr(
          $(DOMobject).attr('data-dbtarget').toString(), 
          jq_select_container.find("select").val(),
          function(attr, value){
            $(DOMobject).text(value);
            jq_select_container.replaceWith(DOMobject);
            $(DOMobject).click(function(){
              ClassRef.processSelectable(DOMobject);
            });
            ClassRef.addSelectField(DOMobject);
          }//end of call back
        );
      });
    },
    initialize:function(){
      var ClassRef = this;
      //updating position of api server
      if (window.location.href.slice(0,16) != "http://localhost")
      ClassRef.set("apiServerURL", "http://listingtest-u7yhjm.rhcloud.com") ;
      else {
        ClassRef.set("apiServerURL", "http://localhost:3000");
      }
      ClassRef.set("db_id", helpers.db_id);
      console.log("init of editables_controler , anonymous Class(): " + ClassRef.get("db_id"));

      /*make every editable  eligible for editing!*/
      $.each($(".editable"),function(index, DOMobject){
        $(DOMobject).click(function(){
          ClassRef.processEditable(DOMobject );
        });
        ClassRef.addEditField(DOMobject);
      });

      $.each($(".selectable"), function(index, DOMobject){
        $(DOMobject).click(function(){
          ClassRef.processSelectable(DOMobject);
        });
        ClassRef.addSelectField(DOMobject);
      });

      /*process slide bar*/
      $( "#price-slider" ).slider({
        value:parseInt($('#Monthly_price_string').html()),
        max:1500,
        min:100,
        step:5,
        slide:function(event, ui){
          $('#Monthly_price_string').html(ui.value);
          $('#price_amount').text("$"+ui.value.toString());
        },
        change:function(event, ui) {
          console.log("going to set price at " + ui.value);

          ClassRef.updateAttr(
            $( "#price-slider" ).attr("data-dbtarget"),
            ui.value,
            function(attr, value){
              console.log("value successfully updated");  
          });
        }
      });
            /* submit button logic of .selectable-group*/

      $.each($('.selectable-group-form'), function(index, value){
        $(value).on('submit',function(event) {
        event.preventDefault();
        
          var keys = [];
          var values = [];
          console.log(value)
          console.log($(value).serializeArray());
          _.each($(this).serializeArray(), function( element, index, array){
            keys.push(element["name"]);
            values.push(element["value"]== "on");
          });
          
          var data = _.object( keys, values );
          console.log("to be uploaded data " + JSON.stringify(data));
          ClassRef.updateAttr( $(this).attr('data-dbtarget') , data, function(attr, value){
            console.log("updateAttr invokded at for selectable-group-form");
          });
        });
      });
    }


  }) )();  //end of editables_controler initialization and its class definition

  

}); // end of ready()


    /*
      programmer's reference, file object is like following, this is not a JSON.stringify
      {
          "upload": {
              "progress": 100,
              "total": 159233,
              "bytesSent": 159233
          },
          "status": "success",
          "previewElement": {},
          "previewTemplate": {},
          "accepted": true,
          "width": 1200,
          "height": 530,
          "name":"test11.png"
          "processing": true,
          "xhr": {
              "response": JSON
              "responseText": JSON
          }
      }
      {
      {
        url: "https://esimgserver.s3-us-west-2.amazonaws.com/dropzone/img3.jpg",
        db_id: "dropzone",
        filename: "img3.jpg",
        operation: "upload",
        msg_source: "uploadToS3 of s3lib.js"
      }
    }
    */