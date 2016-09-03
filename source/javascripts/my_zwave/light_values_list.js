var RSVP = require('rsvp');
var $ = window.jQuery;
var foreach = require('lodash.foreach');
var map = require('lodash.map');
var keys = require('lodash.keys');

module.exports = function () {
  var $lights = $('#lights');

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
    $lights.find('tr .value').text('?');

    RSVP.Promise.cast($.getJSON('/my_zwave/current_lights'))
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

    var list = $('<div>');

    foreach(lightValues, function (value) {
      var activeClass = ' mdl-button--colored';

      var buttonClasses = 'mdl-chip mdl-cell--12-col mdl-cell--8-col-desktop mdl-cell--2-offset-desktop' +
                          ' mdl-js-button mdl-button--raised mdl-js-ripple-effect light-button';

      if (value.value > 0) {
        buttonClasses = buttonClasses + activeClass;
      }

      var button = '<span class="' + buttonClasses + '">' +
        '<span class="mdl-chip__contact">' + value.value + '</span>' +
        '<span class="mdl-chip__text">' + value.displayName + '</span>' +
      '</span>';

      list.append($(button));
    });

    $lights.html(list);
  }

  function updateLightValue(displayName, value) {
    $lights.find('[data-name="' + displayName + '"] .value').text(value);
  }

  var publicMethods = {
    show: show
  };

  return publicMethods;
};
