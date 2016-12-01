'use strict';
var programmesList = require('./programmes_list');
var loginDialog    = require('./login_dialog');
var userFeedback   = require('./user_feedback');

var programmeButtonsListComponent = require('./components/programme_buttons_list.vue');
var vacationModeComponent = require('./components/vacation_mode.vue');
var lightsListComponent = require('./components/lights_list.vue');
var latestEventsComponent = require('./components/latest_events.vue');

var nodeValueTranslator = require('./node_value_translator')();

var keys = require('lodash.keys');
var map = require('lodash.map');
var foreach = require('lodash.foreach');
var RSVP = require('rsvp');

var post = require('./post');

var Vue = window.Vue;

RSVP.on('error', function (error) { console.error(error); });
var getJSON = require('./get_json');

var programmesListInterface = programmesList();

var App = new Vue({
  el: '#app',
  props: ['programmes', 'activeProgrammeId', 'lights', 'vacationModeState', 'latestEvents'],
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

    vacationModeStartRequested: function (onTime, offTime) {
      var newState = {
        state: 'on',
        'start_time': onTime,
        'end_time': offTime
      };

      post('/my_zwave/vacation_mode', newState)
      .then(function () {
        App.vacationModeState = newState;

        feedback.addMessage('Started vacation mode');
      })
      .catch(function () {
        feedback.addMessage('Could not start vacation mode');
      });
    },

    vacationModeStopRequested: function () {
      post('/my_zwave/vacation_mode', {
        state: 'off'
      })
      .then(function () {
        App.vacationModeState.state = 'off';

        feedback.addMessage('Stopped vacation mode');
      })
      .catch(function () {
        feedback.addMessage('Could not stop vacation mode');
      });
    },
    reloadLights: function () {
      this.loadLights();
    },
    loadLights: function () {
      getJSON('/my_zwave/current_lights').then(function (data) {
        var lights;

        lights = map(keys(data.lights), function (name) {
          var row = data.lights[name];
          var light = {nodeId: row.node_id, name: name, type: row.type};

          light.value = nodeValueTranslator.fromServer(row.value, light);

          return light;
        });
        App.lights = lights;
      });
    }
  }
});

var feedback = userFeedback(document.querySelector('.js-snackbar'));

function start() {
  programmesListInterface.getProgrammes().then(function (programmes) {
    App.programmes = programmes;
  }).then(function () {
    App.loadLights();

    getJSON('/my_zwave/vacation_mode')
      .then(function (data) {
        App.vacationModeState = data;
      });

    getJSON('/my_zwave/latest_events').then(function (data) {
      App.latestEvents = map(data, function (row) {
        return JSON.parse(row);
      });
    });

    showData();
  }).catch(function (jqXHR) {
    loginDialog.$on('login-succeeded', function () {
      start();
    });

    loginDialog.$on('login-failed', function (message) {
      feedback.addMessage(message);
    });

    loginDialog.visible = true;
  });

  function showData() {
    getJSON('/my_zwave/current_programme')
      .then(function (data) {
        App.activeProgrammeId = data.programme;
      });
  }
}

start();
