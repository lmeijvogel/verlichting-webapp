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
        fillTable(data);
      });
  }

  function fillTable(data) {
    var lightValues = map(keys(data.lights), function (key) {
      var light = data.lights[key];

      return {
        displayName: key.substr(5),
        value:       lightValueToString(light.value)
      };
    });

    var table = $('<table class="mdl-data-table mdl-js-data-table current-light-values">');

    foreach(lightValues, function (value) {
      var rowHtml = '<tr data-name="' + value.displayName + '">' +
      '<td class="key mdl-data-table__cell--non-numeric">' + value.displayName + '</td>' +
      '<td class="value mdl-data-table__cell--numeric">' + value.value + '</td>' +
      '</tr>';

      table.append($(rowHtml));
    });

    $lights.html(table);
  }

  function updateLightValue(displayName, value) {
    $lights.find('[data-name="' + displayName + '"] .value').text(value);
  }

  var publicMethods = {
    show: show
  };

  return publicMethods;
};
