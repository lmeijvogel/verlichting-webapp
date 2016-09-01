var createButton = require('./button');
var RSVP = require('rsvp');
var $ = window.jQuery;
var foreach = require('lodash.foreach');
var keys = require('lodash.keys');
var map = require('lodash.map');

module.exports = function (userFeedback) {
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
    return RSVP.Promise.cast($.getJSON('/my_zwave/available_programmes')).then(function (json) {
      return json.availableProgrammes;
    });
  }

  function selectProgramme(programmeName) {
    return RSVP.Promise.cast($.post('/my_zwave/programme/' + programmeName + '/start'));
  }

  function makeButton(programmeId, programmeName) {
    var button = createButton(programmeId, programmeName);

    programmeChosenHandlers.subscribe(button.newProgrammeChosen);

    button.onClick(function () {
      selectProgramme(programmeId).then(function () {
        programmeChosenHandlers.notify(programmeId);
      }).catch(function (jqXHR) {
        button.element.addClass('mdl-button--accent');

        userFeedback.addMessage(jqXHR.responseText);
      });
    });

    return button;
  }

  function makeButtons(programmes) {
    return map(keys(programmes), function (programmeId) {
      var programmeName = programmes[programmeId];

      return makeButton(programmeId, programmeName);
    });
  }

  var makeButtonsList = function () {
    return getProgrammes().then(function (programmes) {
      var buttons = makeButtons(programmes);
      var $container = $('<div class="programmes mdl-grid"></div>');

      $container.append(map(buttons, function (button) {
        return button.element;
      }));

      return $container;
    });
  };

  var publicMethods = {
    makeButtonsList:           makeButtonsList,
    selectProgramme:           programmeChosenHandlers.notify
  };

  return publicMethods;
};
