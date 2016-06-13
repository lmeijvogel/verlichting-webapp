var RSVP = require('rsvp');
var $ = require('jquery');
var _ = require('lodash');

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
    var rowTemplate = _.template('<tr data-name="${displayName}">' +
      '<td class="key">${displayName}</td>' +
      '<td class="value">${value}</td>' +
      '</tr>');

    var lightValues = _.chain(data.lights).keys().map(function (key) {
      var light = data.lights[key];

      return {
        displayName: key.substr(5),
        value:       lightValueToString(light.value)
      };
    });

    var table = $('<table class="table table-striped">');

    lightValues.each(function (value) {
      var rowHtml = rowTemplate(value);

      table.append($(rowHtml));
    }).value();

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
