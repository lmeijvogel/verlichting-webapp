var RSVP = require('rsvp');
var $ = require('jquery');
var _ = require('lodash');

module.exports = function (userFeedback) {
  var programmeChosenHandlers = (function () {
    var programmeChangedListeners = [];

    var publicMethods = {
      subscribe: function (handler) {
        programmeChangedListeners.push(handler);
      },

      notify: function (newProgrammeId) {
        _.each(programmeChangedListeners, function (handler) {
          handler(newProgrammeId);
        });
      }
    };

    return publicMethods;
  })();

  function getProgrammes() {
    return {
      'off':        'Off',
      'evening':    'Evening',
      'evening_tv': 'Evening (TV off)',
      'dimmed':     'Dimmed',
      'night':      'Night',
      'morning':    'Morning',
      'full':       'Full'
    };
  }

  function selectProgramme(programmeName) {
    return RSVP.Promise.cast($.post('/my_zwave/programme/' + programmeName + '/start'));
  }

  var programmeButtonTemplate = (function () {
    var buttonClasses = 'selectProgrammeButton btn btn-lg btn-default';
    var template = '<button type="button" class="' + buttonClasses + '">${programmeName}</button>';

    return _.template(template);
  })();

  function makeButtons(programmes) {
    return _.chain(programmes).keys().map(function (programmeId) {
      var programmeName = programmes[programmeId];

      return makeButton(programmeId, programmeName);
    }).value();
  }

  function makeButton(programmeId, programmeName) {
    var button = $(programmeButtonTemplate({programmeId: programmeId, programmeName: programmeName}));

    var buttonChanged = function (newProgrammeId) {
      button.removeClass('btn-danger');
      if (newProgrammeId == programmeId) {
        button.removeClass('btn-default').addClass('btn-primary');
      } else {
        button.removeClass('btn-primary').addClass('btn-default');
      }
    };

    programmeChosenHandlers.subscribe(buttonChanged);

    button.click(function () {
      selectProgramme(programmeId).then(function () {
        programmeChosenHandlers.notify(programmeId);
      }).catch(function (jqXHR) {
        button.removeClass('btn-default').addClass('btn-danger');

        userFeedback.addMessage(jqXHR.responseText);
      });
    });

    var $li = $('<li class="row"></li>');

    $li.append(button);
    return $li;
  }

  var makeButtonsList = function () {
    var programmes = getProgrammes();
    var buttons = makeButtons(programmes);
    var $ul = $('<ul class="programmes"></ul>');

    $ul.append(buttons);

    return $ul;
  };

  var publicMethods = {
    makeButtonsList:           makeButtonsList,
    subscribeProgrammeChanged: programmeChosenHandlers.subscribe,
    selectProgramme:           programmeChosenHandlers.notify
  };

  return publicMethods;
};
