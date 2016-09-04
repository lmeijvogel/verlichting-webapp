'use strict';
var programmesList = require('./programmes_list');
var lightValuesList = require('./light_values_list');
var showLoginDialog = require('./show_login_dialog');
var userFeedback    = require('./user_feedback');
var VacationMode    = require('./vacation_mode');
var latestEvents    = require('./latest_events');

var RSVP = require('rsvp');

var getJSON = require('./get_json');
var $ = window.jQuery;

$(function () {
  function start() {
    var feedback = userFeedback(document.querySelector('.js-snackbar'));

    var programmesListInterface = programmesList(feedback);

    programmesListInterface.makeButtonsList().then(function (buttonsHtml) {
      $('.programme-button-list').html(buttonsHtml);

      var currentValues           = lightValuesList();

      var vacationMode = new VacationMode($('.js-vacation-mode--off'), $('.js-vacation-mode--on'));

      latestEvents($('.js-latest-events')).start();

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
