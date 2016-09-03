var foreach = require('lodash.foreach');
var RSVP = require('rsvp');

var $post = window.jQuery.post;
var $getJSON = window.jQuery.getJSON;

module.exports = function ($offSelector, $onSelector) {
  var callbacks = {};

  function start() {
    RSVP.Promise.cast($getJSON('/my_zwave/vacation_mode'))
      .then(function (data) {
        var vacationMode = data.state == 'on';

        if (vacationMode) {
          showVacationMode(data.start_time, data.end_time);
        } else {
          hideVacationMode();
        }
      });

    $offSelector.find('[data-behavior=start-vacation]').click(function () {
      var startTime = $offSelector.find('#start-time')[0].value;
      var endTime = $offSelector.find('#end-time')[0].value;

      RSVP.Promise.cast($post('/my_zwave/vacation_mode', {
        state: 'on',
        'start_time': startTime,
        'end_time': endTime
      }))
      .then(function () {
        trigger('notice', 'Started vacation mode');
        showVacationMode(startTime, endTime);
      })
      .catch(function () {
        trigger('error', 'Could not start vacation mode');
      });
    });

    $onSelector.find('[data-behavior=stop-vacation]').click(function () {
      RSVP.Promise.cast($post('/my_zwave/vacation_mode', {
        state: 'off'
      }))
      .then(function () {
        trigger('notice', 'Stopped vacation mode');

        hideVacationMode();
      })
      .catch(function () {
        trigger('error', 'Could not stop vacation mode');
      });
    });
  }

  function on(event, callback) {
    if (!callbacks[event]) {
      callbacks[event] = [];
    }
    callbacks[event].push(callback);
  }

  function trigger(event, arg) {
    foreach(callbacks[event], function (callback) {
      callback(arg);
    });
  }

  function showVacationMode(startTime, endTime) {
    $onSelector.find('[data-target=vacation-mode__start-time]').text(startTime);
    $onSelector.find('[data-target=vacation-mode__end-time]').text(endTime);

    $offSelector.addClass('vacation-mode--hidden');
    $onSelector.removeClass('vacation-mode--hidden');
  }

  function hideVacationMode() {
    $onSelector.addClass('vacation-mode--hidden');
    $offSelector.removeClass('vacation-mode--hidden');
  }

  return {
    start: start,
    on:    on
  };
};
