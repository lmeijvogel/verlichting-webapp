'use strict';
var Vue = require('vue');
var VueResource = require('vue-resource');

Vue.use(VueResource);

var programmesList = require('./programmes-list');
var loginDialog    = require('./login-dialog-container');
var userFeedback   = require('./user-feedback');

var programmeButtonsListComponent = require('./components/programme-buttons-list.vue');
var vacationModeComponent = require('./components/vacation-mode.vue');
var lightsListComponent = require('./components/lights-list.vue');
var latestEventsComponent = require('./components/latest-events.vue');

var nodeValueTranslator = require('./node-value-translator')();

var Vue = require('vue');

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

      this.$http.post('/my_zwave/vacation_mode', newState)
      .then(function () {
        App.vacationModeState = newState;

        feedback.addMessage('Started vacation mode');
      })
      .catch(function () {
        feedback.addMessage('Could not start vacation mode');
      });
    },

    vacationModeStopRequested: function () {
      this.$http.post('/my_zwave/vacation_mode', {
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
      this.$http.get('/my_zwave/current_lights').then(function (response) {
        return response.json();
      }).then(function (json) {
        var lights = Object.keys(json.lights).map(function (name) {
          var row = json.lights[name];
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

    App.$http.get('/my_zwave/vacation_mode')
      .then(function (response) {
        return response.json();
      }).then(function (data) {
        App.vacationModeState = data;
      });

    App.$http.get('/my_zwave/latest_events').then(function (response) {
      return response.json();
    }).then(function (data) {
      App.latestEvents = data.map(function (row) {
        return JSON.parse(row);
      });
    });

    App.$http.get('/my_zwave/current_programme')
      .then(function (response) {
        return response.json();
      }).then(function (data) {
        App.activeProgrammeId = data.programme;
      });
  }).catch(function (jqXHR) {
    loginDialog.$on('login-succeeded', function () {
      start();
    });

    loginDialog.$on('login-failed', function (message) {
      feedback.addMessage(message);
    });

    loginDialog.visible = true;
  });
}

start();
