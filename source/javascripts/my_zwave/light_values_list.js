var RSVP = require('rsvp');
var foreach = require('lodash.foreach');
var map = require('lodash.map');
var keys = require('lodash.keys');

var getJSON = window.jQuery.getJSON;

module.exports = function () {
  var lights = document.querySelector('#lights');

  function lightValueToString(value) {
    if (value === 'false' || value === '0') {
      return '-';
    }
    if (value === 'true') {
      return 'on';
    }

    return value;
  }

  function show() {
    foreach(lights.querySelectorAll('.light-value'), function (element) {
      element.innerText = '?';
    });

    RSVP.Promise.cast(getJSON('/my_zwave/current_lights'))
      .then(function (data) {
        createButtons(data);
      });
  }

  function createButtons(data) {
    var lightValues = map(keys(data.lights), function (key) {
      var light = data.lights[key];

      return {
        displayName: key.substr(5),
        value:       lightValueToString(light.value)
      };
    });

    var buttons = map(lightValues, function (value) {
      var button = document.createElement('span');
      var valueDisplay = document.createElement('span');
      var nameDisplay = document.createElement('span');

      button.classList = 'mdl-chip mdl-cell--12-col mdl-cell--8-col-desktop mdl-cell--2-offset-desktop' +
                         ' light-button';
      valueDisplay.classList = 'mdl-chip__contact light-value';

      valueDisplay.innerText = value.value;
      if (value.value == '-') {
        button.classList.add('mdl-color--blue-100');
      } else {
        button.classList.add('mdl-color--amber-600');

        valueDisplay.classList.add('mdl-color--yellow');
        valueDisplay.classList.add('mdl-color--yellow');
      }

      nameDisplay.classList = 'mdl-chip__text';
      nameDisplay.innerText = value.displayName;

      button.appendChild(valueDisplay);
      button.appendChild(nameDisplay);

      return button;
    });

    while(lights.firstChild) {
      lights.removeChild(lights.firstChild);
    }

    foreach(buttons, function (button) {
      lights.appendChild(button);
    });
  }

  function updateLightValue(displayName, value) {
    lights.querySelector('[data-name="' + displayName + '"] .value').innerText(value);
  }

  var publicMethods = {
    show: show
  };

  return publicMethods;
};
