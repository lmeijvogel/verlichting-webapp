'use strict';
var programmesList = require('./programmes_list');
var showLoginDialog = require('./show_login_dialog');
var userFeedback    = require('./user_feedback');
//var VacationMode    = require('./vacation_mode');
var latestEvents    = require('./latest_events');

var createLightValueDialog = require('./create_light_value_dialog');

var programmeButtonComponent = require('./components/programme_button');
var programmeButtonsListComponent = require('./components/programme_buttons_list');
var vacationModeComponent = require('./components/vacation_mode');
var lightValueChip = require('./components/light_value_chip');

var keys = require('lodash.keys');
var map = require('lodash.map');
var foreach = require('lodash.foreach');
var RSVP = require('rsvp');

var Vue = window.Vue;

RSVP.on('error', function (error) { console.error(error); });
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
    var programmesListInterface = programmesList();

    var App = new Vue({
      el: '#app',
      props: ['programmes', 'activeProgrammeId', 'lights'],
      methods: {
        programmeRequested: function (programme) {
          var self = this;

          programmesListInterface.selectProgramme(programme.id).then(function () {
            self.activeProgrammeId = programme.id;
          }).catch(function (error) {
            if (error && error.responseText) {
              feedback.addMessage(error.responseText);
            } else {
              feedback.addMessage('Kon programma niet selecteren.');
            }
          });
        },

        changeLightValue: function (light) {
          var valueDialogElement = document.querySelector('.light-value-dialog');
          var switchDialogElement = document.querySelector('.light-switch-dialog');
          var lightValueDialog = createLightValueDialog(valueDialogElement, 'dim');
          var lightSwitchDialog = createLightValueDialog(switchDialogElement, 'switch');

          var dialog;
          var oldValue = light.value;

          if (light.type == 'dim') {
            dialog = lightValueDialog;
          } else {
            dialog = lightSwitchDialog;
          }

          dialog.show(light.displayName, light.value, function (value) { light.value = value; })
            .then(function (newValue) {
              light.value = newValue;
            })
            .catch(function () {
              light.value = oldValue;
            });
        }
      }
    });

    var feedback = userFeedback(document.querySelector('.js-snackbar'));

    programmesListInterface.getProgrammes().then(function (programmes) {
      // TODO : Move keys.map () to programmesListInterface
      App.programmes = map(keys(programmes), function (id) {
        return {id: id, name: programmes[id]};
      });
    }).then(function () {
      getJSON('/my_zwave/current_lights').then(function (data) {
        var lights;

        lights = map(keys(data.lights), function (name) {
          var row = data.lights[name];

          return {nodeId: row.node_id, name: name, value: row.value, type: row.type};
        });
        App.lights = lights;
      });

      //var vacationMode = new VacationMode(
        //document.querySelector('.js-vacation-mode--off'),
        //document.querySelector('.js-vacation-mode--on')
      //);

      latestEvents(document.querySelector('.js-latest-events')).start();

      //vacationMode.on('error', function (message) {
        //feedback.addMessage(message);
      //});

      //vacationMode.on('notice', function (message) {
        //feedback.addMessage(message);
      //});

      //vacationMode.start();

      //document.querySelector('.js-reload-lights').addEventListener('click', currentValues.update);

      showData();
    });

    function showData() {
      getJSON('/my_zwave/current_programme')
        .then(function (data) {
          App.activeProgrammeId = data.programme;
        });
    }
  }

  start();
});
