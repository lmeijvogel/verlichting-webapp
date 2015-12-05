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
    $lights.html('');

    RSVP.Promise.cast($.getJSON('/my_zwave/current_lights'))
      .then(function (data) {
        var lights = data.lights;
        var table = $('<table class="table table-striped">');

        _.chain(lights).keys().map(function (key) {
          var light = lights[key];
          var value = lightValueToString(light.value);

          return '<tr><td>' + key.substr(5) + '</td><td>' + value + '</td></tr>';
        }).each(function (rowHtml) {
          table.append($(rowHtml));
        }).run();

        $lights.append(table);
      });
  }

  var publicMethods = {
    show: show
  };

  return publicMethods;
};
