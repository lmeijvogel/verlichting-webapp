$(function() {
  $(".selectProgramme").click(function() {
    var self = this;
    var programmeName = jQuery(this).data('programme-name');

    selectProgramme(programmeName).then(function() {
      jQuery(".selectProgramme").removeClass("btn-danger").removeClass("btn-primary").addClass("btn-default");
      jQuery(self).removeClass("btn-default").addClass("btn-primary");
      clearError();
    }).then(function() {
      if (jQuery("#auto_off").is(":checked")) {
        // Pick a random time around 23:00
        var date = moment({hours: 23, minutes: 0});
        date.add('minutes', (Math.random()*60)-30);

        RSVP.Promise.cast(jQuery.ajax({
          url: "/my_zwave/scheduled_tasks",
          data: { name: "off", datetime: date.toJSON() },
          type: "PUT"
        }))
        .then(function(jqXHR) {
          var json = JSON.parse(jqXHR);
          var date = moment(json.date);

          var displayableTime = date.format("HH:mm");

          setNotice("Scheduled off at "+ displayableTime);
        });
      }
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

function setNotice(notice) {
  $(".notice").text(notice).fadeIn();
}

function clearError() {
  $(".error").fadeOut().text("");
}

function clearNotice() {
  $(".notice").fadeOut().text("");
}

function showLogin() {
  $(".loginDialog").fadeIn();
}

function hideLogin() {
  $(".loginDialog").fadeOut();
}
