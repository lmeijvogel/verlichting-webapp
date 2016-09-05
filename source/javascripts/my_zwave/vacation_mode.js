var foreach = require('lodash.foreach');

var post = require('./post');
var getJSON = require('./get_json');

module.exports = function (offElement, onElement) {
  var callbacks = {};

  function start() {
    getJSON('/my_zwave/vacation_mode')
      .then(function (data) {
        var vacationMode = data.state == 'on';

        if (vacationMode) {
          showVacationMode(data.start_time, data.end_time);
        } else {
          hideVacationMode();
        }
      });

    var startButton = offElement.querySelector('[data-behavior=start-vacation]');

    startButton.addEventListener('click', function () {
      var startTime = offElement.querySelector('#start-time').value;
      var endTime = offElement.querySelector('#end-time').value;

      post('/my_zwave/vacation_mode', {
        state: 'on',
        'start_time': startTime,
        'end_time': endTime
      })
      .then(function () {
        trigger('notice', 'Started vacation mode');
        showVacationMode(startTime, endTime);
      })
      .catch(function () {
        trigger('error', 'Could not start vacation mode');
      });
    });

    var stopButton = onElement.querySelector('[data-behavior=stop-vacation]');

    stopButton.addEventListener('click', function () {
      post('/my_zwave/vacation_mode', {
        state: 'off'
      })
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
    onElement.querySelector('[data-target=vacation-mode__start-time]').innerText = startTime;
    onElement.querySelector('[data-target=vacation-mode__end-time]').innerText = endTime;

    offElement.classList.add('vacation-mode--hidden');
    onElement.classList.remove('vacation-mode--hidden');
  }

  function hideVacationMode() {
    onElement.classList.add('vacation-mode--hidden');
    offElement.classList.remove('vacation-mode--hidden');
  }

  return {
    start: start,
    on:    on
  };
};
