var createButton = require('./button');
var RSVP = require('rsvp');
var $ = require('jquery');
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
        button.element.removeClass('btn-default').addClass('btn-danger');

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
      var $ul = $('<ul class="programmes"></ul>');

      $ul.append(map(buttons, function (button) {
        return button.element;
      }));

      return $ul;
    });
  };

  var publicMethods = {
    makeButtonsList:           makeButtonsList,
    selectProgramme:           programmeChosenHandlers.notify
  };

  return publicMethods;
};
