var _ = require('lodash');
var RSVP = require('rsvp');

var $post = require('jquery').post;
var $getJSON = require('jquery').getJSON;

module.exports = function ($selector) {
  var rowTemplate = _.template('<tr>' +
    '<td class="col-xs-6 col-sm-3">${time}</td>' +
    '<td class="hidden-xs col-sm-4">${initiator}</td>' +
    '<td class="hidden-xs col-sm-4">${event}</td>' +
    '<td class="col-xs-6 col-sm-1">${data}</td>' +
  '</tr>');

  var months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
                'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  var dateTemplate = _.template('${date} ${month} ${hour}:${minute}');

  function start() {
    RSVP.Promise.cast($getJSON('/my_zwave/latest_events')).then(function (data) {
      var html = makeTable(data);

      $selector.html(html);
    });
  }

  function makeTable(data) {
    var rows = _.map(data, function (rowData) {
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

    var zeroes = _.map(_.times(numberOfZeroes), function () {
      return '0';
    });

    return zeroes + str;
  }

  return {
    start: start
  };
};
