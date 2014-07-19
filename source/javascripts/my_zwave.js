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
          url: "/my_zwave/scheduled_tasks/new",
          data: { name: "off", datetime: date.toJSON() },
          type: "POST"
        }))
        .then(function(jqXHR) {
          var json = JSON.parse(jqXHR);
          var date = moment(json.date);

          var displayableTime = date.format("HH:mm");

          setNotice("Scheduled off at "+ displayableTime);
          printScheduledProgrammes();
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

  $("body").on("click", ".schedule .click", function() {
    var $row = jQuery(this).closest("tr");
    var id = $row.data('job-id');

    RSVP.Promise.cast(jQuery.post("/my_zwave/schedule/"+id+"/destroy"))
      .then(function() {
        $row.fadeOut();
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

  printScheduledProgrammes();
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

function printScheduledProgrammes() {
  RSVP.Promise.cast(jQuery.get("/my_zwave/scheduled_tasks/list"))
    .then(function(data) {
      var $scheduleTable = jQuery("<table class='schedule table'></table>");
      jQuery("#schedule").html($scheduleTable);

      var template = _.template("<tr data-job-id='${id}'><td>${job}</td><td>${date}</td><td class='click'><a>click</a></td></tr>");

      var jsonData = _.sortBy(JSON.parse(data), function(element) {
        return moment(element.date).unix();
      });

      _.each(jsonData, function(row) {
        console.log(row);
        var templateRow = template({'id': row.id, 'job': row.job, 'date': moment(row.date).format("dddd D MMMM HH:mm")});

        var $templateRow =jQuery(templateRow);

        $scheduleTable.append($templateRow);
      });
    })
    .catch(function(data) {
    });
}
