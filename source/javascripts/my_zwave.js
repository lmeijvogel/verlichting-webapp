$(function() {
  $(".selectProgramme").click(function() {
    var self = this;
    var programmeName = jQuery(this).data('programme-name');

    selectProgramme(programmeName).then(function() {
      activateButton(programmeName);
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

  $("body").on("click", ".schedule .delete", function() {
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

  $("h1.lights").on("click", function() {
    self.showLightValues();
  });

  printScheduledProgrammes();
  highlightCurrentProgramme();
  showLightValues();
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
      var $scheduleTable = jQuery("<table class='schedule table-striped col-lg-offset-3 col-lg-6'></table>");
      jQuery("#schedule").html($scheduleTable);

      var template = _.template("<tr data-job-id='${id}'><td class='col-lg-2'>${job}</td><td class='col-lg-2'>${date}</td><td class='col-lg-2'><button class='delete btn btn-default'>Delete</button></td></tr>");

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

function highlightCurrentProgramme() {
  RSVP.Promise.cast(jQuery.getJSON("/my_zwave/current_programme"))
    .then(function(data) {
      activateButton(data.programme);
    });
}

function activateButton(programmeName) {
  var button = jQuery(".selectProgramme[data-programme-name="+programmeName);

  jQuery(".selectProgramme").removeClass("btn-danger").removeClass("btn-primary").addClass("btn-default");
  jQuery(button).removeClass("btn-default").addClass("btn-primary");
}

function showLightValues() {
  var $lights = jQuery("#lights");
  $lights.html("");

  RSVP.Promise.cast(jQuery.getJSON("/my_zwave/current_lights"))
    .then(function(data) {
      var lights = data.lights;
      var table = jQuery("<table class='table table-striped'>");

      _.each(_.keys(lights), function(key) {
        var light = lights[key];

        var value = lightValueToString(light.value);
        table.append(jQuery("<tr><td>"+key.substr(5)+"</td><td>"+value+"</td></tr>"));
      });

      $lights.append(table);
    });
}

function lightValueToString(value) {
  if (value === "false" || value === "0") {
    return "-";
  }
  if (value === "true") {
    return "on";
  }

  return value;
}
