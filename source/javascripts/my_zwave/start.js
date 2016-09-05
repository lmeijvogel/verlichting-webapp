'use strict';
var programmesList = require('./programmes_list');
var lightValuesList = require('./light_values_list');
var showLoginDialog = require('./show_login_dialog');
var userFeedback    = require('./user_feedback');
var VacationMode    = require('./vacation_mode');
var latestEvents    = require('./latest_events');

var RSVP = require('rsvp');

var getJSON = require('./get_json');

function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function () {
  function start() {
    var feedback = userFeedback(document.querySelector('.js-snackbar'));

    var programmesListInterface = programmesList(document.querySelector('.programme-button-list'), feedback);

    programmesListInterface.createButtonsList().then(function () {
      var currentValues           = lightValuesList();

      var vacationMode = new VacationMode(
        document.querySelector('.js-vacation-mode--off'),
        document.querySelector('.js-vacation-mode--on')
      );

      latestEvents(document.querySelector('.js-latest-events')).start();

      vacationMode.on('error', function (message) {
        feedback.addMessage(message);
      });

      vacationMode.on('notice', function (message) {
        feedback.addMessage(message);
      });

      vacationMode.start();

      document.querySelector('.js-reload-lights').addEventListener('click', currentValues.show);

      currentValues.show();

      showData();
    }).catch(function (jqXHR) {
      if (jqXHR.status == 401) {
        showLoginDialog().then(function () {
          start();
        });
      }
    });

    function showData() {
      getJSON('/my_zwave/current_programme')
        .then(function (data) {
          programmesListInterface.selectProgramme(data.programme);
        });
    }
  }

  start();
});
