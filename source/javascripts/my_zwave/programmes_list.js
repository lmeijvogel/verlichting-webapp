var createButton = require('./button');
var foreach = require('lodash.foreach');
var keys = require('lodash.keys');
var map = require('lodash.map');

var getJSON = require('./get_json');
var post = require('./post');

module.exports = function (element, userFeedback) {
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
    return post('/my_zwave/programme/' + programmeName + '/start');
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

  var createButtonsList = function () {
    return getProgrammes().then(function (programmes) {
      var buttons = makeButtons(programmes);
      var container = document.createElement('div');

      container.classNames = 'programmes mdl-grid';

      foreach(buttons, function (button) {
        container.appendChild(button.element);
      });

      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }

      element.appendChild(container);
    });
  };

  var publicMethods = {
    createButtonsList:         createButtonsList,
    selectProgramme:           programmeChosenHandlers.notify
  };

  return publicMethods;
};
