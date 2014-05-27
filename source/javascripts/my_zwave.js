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
      if (jqXHR.status == 401) {
        showLogin();
      } else {
        jQuery(self).removeClass("btn-default").addClass("btn-danger");

        setError(jqXHR.responseText);
      }
    });
  });

  $("body").on("click", ".loginDialog .submit", function() {
    var username = $("#username").val();
    var password = $("#password").val();
    var request = $.post("/my_zwave/login/create", { username: username, password: password });
    RSVP.Promise.cast(request)
      .then( function() {
        hideLogin();
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

function showLogin() {
  $(".loginDialog").fadeIn();
}

function hideLogin() {
  $(".loginDialog").fadeOut();
}
