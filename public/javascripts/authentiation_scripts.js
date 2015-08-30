//listing_layout.jade imports authentication_scripts.js
//
$(document).ready(function authReadyCallBack(){
      /*prepare auth_modals*/
    if($('.switch-modal').length > 0){
      /*there is auth modals in this page*/
      $('.switch-modal').click(function swithModal () {
        var this_el = this;
        $($(this).attr("data-es-close-modal")).modal("hide");
        
        setTimeout(function openNewModal () {
          $($(this_el).attr("data-es-switch-modal")).modal("show");
        },500);
      });
    }
    function clearInfo(modal){
      $(modal).find('.error-info, .success-info').hide();
      $(modal).find('.error-info-p, .success-info-p').text( "");
    }

    $('.modal form').on("submit",function (event){
      event.preventDefault();
      var $target_form = $(this);
      var $pparent = $target_form.parent().parent();
      clearInfo($pparent);
      $.ajax({
        url: $target_form.attr("action"),
        data:$target_form.serialize(),
        type:"POST" ,
        success:function(data, textStatus, jqXHR){  // Function( Anything data, String textStatus, jqXHR jqXHR )
          if ($target_form.attr("id") === "login_form"){
            location.reload();
          } else if ($target_form.attr("id") == "signup_form"){
            $pparent.find(".success-info").show();
            $pparent.find(".success-info-p").text("member("+ data +") created, please log in the email to activate account");
          } else if ($target_form.attr("id") == "reset_email_form"){
            $pparent.find(".success-info").show();
            $pparent.find(".success-info-p").text(jqXHR.responseText);
          }
          console.log(JSON.stringify(jqXHR));  
        },
        error:function(jqXHR, textStatus,  errorThrown){   // jqXHR jqXHR, String textStatus, String errorThrown
          switch(jqXHR.status){
            case 401:
              $pparent.find(".error-info").show();
              $pparent.find(".error-info-p").text("invalid credential pair supplied");
              break;
            case 404:   // usually reset password will use this
              $pparent.find(".error-info").show();
              $pparent.find(".error-info-p").text(jqXHR.responseText);       
              break;
            default:
              $pparent.find(".error-info").show();
              $pparent.find(".error-info-p").text("unhandled error: " + jqXHR.status);  
              break;
          }
          console.log(JSON.stringify(jqXHR));  
        }
      });
    });

    // handle modal closing event
    $('.auth-modal').on('hidden.bs.modal', function () {
      clearInfo(this);
    })

});