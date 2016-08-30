var map = require('lodash.map');
var times = require('lodash.times');
var RSVP = require('rsvp');

var $post = window.jQuery.post;
var $getJSON = window.jQuery.getJSON;

module.exports = function ($selector) {
  var rowTemplate = function (value) {
    return '<tr>' +
             '<td class="col-xs-6 col-sm-3">' + value.time + '</td>' +
             '<td class="hidden-xs col-sm-4">' + value.initiator + '</td>' +
             '<td class="hidden-xs col-sm-4">' + value.event + '</td>' +
             '<td class="col-xs-6 col-sm-1">' + value.data + '</td>' +
           '</tr>';
  };

  var months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
                'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  var dateTemplate = function (value) {
    return '' + value.date + ' ' + value.month +
          ' ' + value.hour + ':' + value.minute;
  };

  function start() {
    RSVP.Promise.cast($getJSON('/my_zwave/latest_events')).then(function (data) {
      var html = makeTable(data);

      $selector.html(html);
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

    return '<table class="table">' + rows.join('') + '</table>';
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
