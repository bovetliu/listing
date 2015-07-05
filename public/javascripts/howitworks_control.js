$(document).ready(function() {
// ready() call back now
  /* ======= Header Background Slideshow - Flexslider ======= */    
  /* Ref: https://github.com/woothemes/FlexSlider/wiki/FlexSlider-Properties */
  
  $('.bg-slider').flexslider({
      animation: "slide",
      directionNav: false, //remove the default direction-nav - https://github.com/woothemes/FlexSlider/wiki/FlexSlider-Properties
      controlNav: false, //remove the default control-nav
      slideshowSpeed: 4000
  });

});