var RSVP = require('rsvp');
var foreach = require('lodash.foreach');
var map = require('lodash.map');
var keys = require('lodash.keys');

var lightValueChip = require('./light_value_chip');

var getJSON = require('./get_json');

module.exports = function () {
  var lights = document.querySelector('#lights');
  var buttons = null;

  function update() {
    foreach(buttons, function (button) {
      button.setUnknown();
    });

    getJSON('/my_zwave/current_lights').then(function (data) {
      if (buttons == null) {
        createButtons(data);
      } else {
        updateButtons(data);
      }
    });
  }

  function createButtons(data) {
    buttons = {};

    foreach(keys(data.lights), function (key) {
      var value = data.lights[key];
      var displayName = key.substr(5);
      var light = lightValueChip(displayName, value.value);

      buttons[key] = light;
    });

    foreach(buttons, function (button) {
      lights.appendChild(button.element);
    });
  }

  function updateButtons(data) {
    foreach(keys(data.lights), function (key) {
      var value = data.lights[key].value;
      var displayName = key.substr(5);

      buttons[key].setValue(value);
    });
  }

  var publicMethods = {
    update: update
  };

  return publicMethods;
};
