var foreach = require('lodash.foreach');
var RSVP = require('rsvp');

var $post = require('jquery').post;
var $getJSON = require('jquery').getJSON;

module.exports = function ($selector) {
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

    $selector.find('[data-behavior=start-vacation]').click(function () {
      var startTime = $selector.find('#start-time')[0].value;
      var endTime = $selector.find('#end-time')[0].value;

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

    $selector.find('[data-behavior=stop-vacation]').click(function () {
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
    $selector.find('[data-target=vacation-mode__start-time]').text(startTime);
    $selector.find('[data-target=vacation-mode__end-time]').text(endTime);

    $selector.find('.vacation-mode--on').slideDown();
    $selector.find('.vacation-mode--off').slideUp();
  }

  function hideVacationMode() {
    $selector.find('.vacation-mode--on').slideUp();
    $selector.find('.vacation-mode--off').slideDown();
  }

  return {
    start: start,
    on:    on
  };
};
