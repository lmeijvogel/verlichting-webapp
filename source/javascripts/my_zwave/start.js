'use strict';
var programmesList = require('./programmes_list');
var lightValuesList = require('./light_values_list');
var showLoginDialog = require('./show_login_dialog');
var userFeedback    = require('./user_feedback');
var VacationMode    = require('./vacation_mode');
var latestEvents    = require('./latest_events');

var RSVP = require('rsvp');

var $ = require('jquery');

$(function () {
  var errorFeedback = userFeedback($('.error'));
  var noticeFeedback = userFeedback($('.notice'));

  var programmesListInterface = programmesList(errorFeedback);
  var currentValues           = lightValuesList();

  var vacationMode = new VacationMode($('.vacation-mode'));

  latestEvents($('#latest-events')).start();

  vacationMode.on('error', function (message) {
    errorFeedback.addMessage(message);
  });

  vacationMode.on('notice', function (message) {
    noticeFeedback.addMessage(message);
  });

  vacationMode.start();

  programmesListInterface.makeButtonsList().then(function (buttonsHtml) {
    $('#programmeButtons').html(buttonsHtml);
  });

  $('#lightsTitle').on('click', currentValues.show);

  function showData() {
    RSVP.Promise.cast($.getJSON('/my_zwave/current_programme'))
      .then(function (data) {
        programmesListInterface.selectProgramme(data.programme);
      })
    .catch(function (jqXHR) {
      if (jqXHR.status == 401) {
        showLoginDialog().then(function () {
          showData();
        });
      }
    });

    currentValues.show();
  }

  showData();
});
