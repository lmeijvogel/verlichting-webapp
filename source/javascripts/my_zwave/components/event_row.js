var Vue = window.Vue;

var map = require('lodash.map');
var times = require('lodash.times');

var months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
              'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function dateTemplate(value) {
  return '' + value.date + ' ' + value.month +
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

      return dateTemplate({
        date: time.getDate(),
        month: months[time.getMonth()],
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
