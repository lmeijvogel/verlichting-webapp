var RSVP = require('rsvp');
var foreach = require('lodash.foreach');
var map = require('lodash.map');
var keys = require('lodash.keys');

var lightValueChip = require('./light_value_chip');

var getJSON = require('./get_json');

module.exports = function () {
  var lights = document.querySelector('#lights');

  function show() {
    foreach(lights.querySelectorAll('.light-value'), function (element) {
      element.innerText = '?';
    });

    getJSON('/my_zwave/current_lights')
      .then(function (data) {
        createButtons(data);
      });
  }

  function createButtons(data) {
    var lightValues = map(keys(data.lights), function (key) {
      var light = data.lights[key];

      return {
        displayName: key.substr(5),
        value:       light.value
      };
    });

    var buttons = map(lightValues, function (value) {
      return lightValueChip(value);
    });

    while(lights.firstChild) {
      lights.removeChild(lights.firstChild);
    }

    foreach(buttons, function (button) {
      lights.appendChild(button);
    });
  }

  var publicMethods = {
    show: show
  };

  return publicMethods;
};
