'use strict';
var programmesList = require('./programmes_list');
var lightValuesList = require('./light_values_list');
var showLoginDialog = require('./show_login_dialog');
var userFeedback    = require('./user_feedback');
var VacationMode    = require('./vacation_mode');
var latestEvents    = require('./latest_events');

var keys = require('lodash.keys');
var map = require('lodash.map');
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

    Vue.component('programme-button', {
      template: '<div v-on:click="click" v-bind:class="[defaultClasses, activeClasses]">{{programme.name}}</div>',

      data: function () {
        return {
          defaultClasses: 'selectProgrammeButton' +
                          ' mdl-button mdl-js-button mdl-js-ripple-effect' +
                          ' mdl-cell--12-col mdl-cell--8-col-desktop mdl-cell--2-offset-desktop'
        };
      },
      props: ['programme', 'activeProgrammeId'],
      computed: {
        active: function () {
          return this.programme.id == this.activeProgrammeId;
        },

        activeClasses: function () {
          if (this.active) {
            return 'mdl-button--raised mdl-button--colored';
          }
        }
      },

      methods: {
        click: function () {
          this.$emit('selected');
        }
      }
    });

    var programmesButtonList = new Vue({
      el: '#programme-buttons-list',
      data: {
        programmes: [],
        activeProgrammeId: null
      },
      computed: {
        loaded: function () { return this.programmes.length > 0; }
      },
      methods: {
        programmeSelected: function (programme) {
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
        }
      }
    });
    var feedback = userFeedback(document.querySelector('.js-snackbar'));

    programmesListInterface.getProgrammes().then(function (programmes) {
      // TODO : Move keys.map () to programmesListInterface
      programmesButtonList.programmes = map(keys(programmes), function (id) {
        return {id: id, name: programmes[id]};
      });
    }).then(function () {
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

      document.querySelector('.js-reload-lights').addEventListener('click', currentValues.update);

      currentValues.create();

      showData();
    });

    function showData() {
      getJSON('/my_zwave/current_programme')
        .then(function (data) {
          programmesButtonList.activeProgrammeId = data.programme;
        });
    }
  }

  start();
});
