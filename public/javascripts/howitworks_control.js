$(document).ready(function() {
  //resolve the height problem
  //virtual CSS problems fix, I need to keep js code here as little as possible !
  $(".slide").height($(window).height() );
  $(window).on('resize', function(){
    $(".slide").height($(window).height() );
  });


// ready() call back now
  /* ======= Header Background Slideshow - Flexslider ======= */    
  /* Ref: https://github.com/woothemes/FlexSlider/wiki/FlexSlider-Properties */
  //console.log($(window).height() );


  $('.bg-slider').flexslider({
      animation: "slide",
      directionNav: false, //remove the default direction-nav - https://github.com/woothemes/FlexSlider/wiki/FlexSlider-Properties
      controlNav: false, //remove the default control-nav
      slideshowSpeed: 4000
  });

});