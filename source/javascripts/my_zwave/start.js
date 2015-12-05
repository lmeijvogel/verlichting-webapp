var programmesList = require('./programmes_list');
var lightValuesList = require('./light_values_list');
var showLoginDialog = require('./show_login_dialog');
var userFeedback    = require('./user_feedback');
var scheduledProgrammesList = require('./scheduled_programmes_list');

var _ = require('lodash');
var RSVP = require('rsvp');

var $ = require('jquery');

$(function () {
  var errorFeedback = userFeedback($('.error'));
  var noticeFeedback = userFeedback($('.notice'));

  var programmesListInterface = programmesList(errorFeedback);
  var scheduledProgrammes     = scheduledProgrammesList(noticeFeedback);
  var currentValues           = lightValuesList();

  programmesListInterface.subscribeProgrammeChanged(function () {
    if ($('#auto_off').is(':checked')) {
      scheduledProgrammes.scheduleAutoOff().then(function () {
        scheduledProgrammes.generateTable().then(function ($table) {
          $('#schedule').html($table);
        });
      });
    }
  });

  $('#programmeButtons').html(programmesListInterface.makeButtonsList());

  scheduledProgrammes.generateTable().then(function ($table) {
    $('#schedule').html('');
    $('#schedule').append($table);
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
