var foreach = require('lodash.foreach');
var keys = require('lodash.keys');
var map = require('lodash.map');

var getJSON = require('./get_json');
var post = require('./post');

module.exports = function () {
  var programmeChosenHandlers = (function () {
    var programmeChangedListeners = [];

    var publicMethods = {
      subscribe: function (handler) {
        programmeChangedListeners.push(handler);
      },

      notify: function (newProgrammeId) {
        foreach(programmeChangedListeners, function (handler) {
          handler(newProgrammeId);
        });
      }
    };

    return publicMethods;
  })();

  function getProgrammes() {
    return getJSON('/my_zwave/available_programmes').then(function (json) {
      return json.availableProgrammes;
    });
  }

  function selectProgramme(programmeName) {
    return post('/my_zwave/programme/' + programmeName + '/start').then(function () {
      programmeChosenHandlers.notify(programmeName);
    });
  }

  var publicMethods = {
    selectProgramme:           selectProgramme,
    displaySelectedProgramme:  programmeChosenHandlers.notify,
    getProgrammes:             getProgrammes,
  };

  return publicMethods;
};
