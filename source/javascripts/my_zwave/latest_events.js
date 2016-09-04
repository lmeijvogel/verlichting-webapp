var map = require('lodash.map');
var times = require('lodash.times');
var RSVP = require('rsvp');

var $post = window.jQuery.post;
var getJSON = require('./get_json');

module.exports = function (element) {
  var rowTemplate = function (value) {
    return '<tr>' +
             '<td class="mdl-data-table__cell--non-numeric">' + value.time + '</td>' +
             '<td class="mdl-data-table__cell--non-numeric">' + value.initiator + '</td>' +
             '<td class="mdl-data-table__cell--non-numeric">' + value.event + '</td>' +
             '<td class="mdl-data-table__cell--non-numeric">' + value.data + '</td>' +
           '</tr>';
  };

  var months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
                'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  var dateTemplate = function (value) {
    return '' + value.date + ' ' + value.month +
          ' ' + value.hour + ':' + value.minute;
  };

  function start() {
    getJSON('/my_zwave/latest_events').then(function (data) {
      var html = makeTable(data);

      element.innerHTML = html;
    });
  }

  function makeTable(data) {
    var rows = map(data, function (rowData) {
      var parsedRowData = JSON.parse(rowData);

      var time = new Date(parsedRowData.time);
      var formattedTime = dateTemplate({
        date: time.getDate(),
        month: months[time.getMonth()],
        hour: pad(time.getHours()),
        minute: pad(time.getMinutes())
      });

      parsedRowData.time = formattedTime;

      return rowTemplate(parsedRowData);
    });

    return '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">' + header() + rows.join('') + '</table>';
  }

  function header() {
    return '<thead><tr>' +
      '<th class="mdl-data-table__cell--non-numeric">Time</th>' +
      '<th class="mdl-data-table__cell--non-numeric">Source</th>' +
      '<th class="mdl-data-table__cell--non-numeric">Event</th>' +
      '<th class="mdl-data-table__cell--non-numeric">Data</th>' +
      '</tr></thead>';
  }

  function pad(str) {
    var numberOfZeroes = 2 - str.toString().length;

    var zeroes = map(times(numberOfZeroes), function () {
      return '0';
    });

    return zeroes + str;
  }

  return {
    start: start
  };
};
