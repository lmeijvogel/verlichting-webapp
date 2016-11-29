var Vue = window.Vue;

var map = require('lodash.map');
var times = require('lodash.times');

var months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
              'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function dateTemplate(value) {
  return '' + value.dateString +
        ' ' + value.hour + ':' + value.minute;
};

function pad(str) {
  var numberOfZeroes = 2 - str.toString().length;

  var zeroes = map(times(numberOfZeroes), function () {
    return '0';
  });

  return zeroes + str;
}

module.exports = Vue.component('event-row', {
  props: ['data'],
  computed: {
    formattedDate: function () {
      var time = new Date(this.data.time);

      var today = new Date();

      var dateString;

      if (time.getDate() == today.getDate() &&
          time.getMonth() == today.getMonth() &&
          time.getYear() == today.getYear()) {
        dateString = 'Today';
      } else {
        dateString = '' + time.getDate() + ' ' + months[time.getMonth()];
      }

      return dateTemplate({
        dateString: dateString,
        hour: pad(time.getHours()),
        minute: pad(time.getMinutes())
      });
    }
  },
  template: '' +
    '<tr >' +
      '<td class="mdl-data-table__cell--non-numeric">{{formattedDate}}</td>' +
      '<td class="mdl-data-table__cell--non-numeric">{{data.initiator}}</td>' +
      '<td class="mdl-data-table__cell--non-numeric">{{data.event}}</td>' +
      '<td class="mdl-data-table__cell--non-numeric">{{data.data}}</td>' +
    '</tr>'
});
