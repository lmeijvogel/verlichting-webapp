$(function() {
  $(".selectProgramme").click(function() {
    var self = this;
    var programmeName = jQuery(this).data('programme-name');

    selectProgramme(programmeName).then(function() {
      jQuery(".selectProgramme").removeClass("btn-danger").removeClass("btn-primary").addClass("btn-default");
      jQuery(self).removeClass("btn-default").addClass("btn-primary");
      console.log("programmeName", programmeName);
      clearError();
    }).catch(function(jqXHR) {
      jQuery(self).removeClass("btn-default").addClass("btn-danger");
      console.log("Error! "+jqXHR.status);

      setError(jqXHR.responseText);
    });
  });
});

function selectProgramme(programmeName) {
  return RSVP.Promise.cast(jQuery.post("/my_zwave/programme/"+programmeName+"/start"));
}

function setError(error) {
  $(".error").text(error).fadeIn();
}

function clearError() {
  $(".error").fadeOut().text("");
}
