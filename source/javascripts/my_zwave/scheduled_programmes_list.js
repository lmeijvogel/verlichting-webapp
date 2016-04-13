var moment = require('moment');
var RSVP = require('rsvp');
var $ = require('jquery');
var _ = require('lodash');

module.exports = function (userFeedback) {
  function randomTime(mean) {
    // Pick a random time around the given mean hour.
    // E.g. if mean=23, the time will be chosen between
    // 22:30 and 23:30.
    var date = moment({hours: mean, minutes: 0});
    var random0to60 = Math.random() * 60;

    date.add(random0to60 - 30, 'minutes');

    return date;
  }

  function restripeRows(table) {
    table.find('tr').each(function (index) {
      $(this).toggleClass('stripe', !!(index & 1));
    });
  };

  var template = _.template('<tr data-job-id="${id}"><td class="col-lg-2">${job}</td>' +
    '<td class="col-lg-2">${date}</td>' +
    '<td class="col-lg-2"><button class="delete btn btn-default">Delete</button></td>' +
    '</tr>');

  function generateTable() {
    return RSVP.Promise.cast($.get('/my_zwave/scheduled_tasks/list'))
      .then(function (data) {
        var parsedData = JSON.parse(data);

        if (parsedData.length === 0) {
          return $('<div class="center-block">(none)</div>');
        } else {
          return createTableFromData(parsedData);
        }
      })
      .catch(function () {
        //TODO
      });
  };

  function createTableFromData(parsedData) {
    var $scheduleTable = $('<table class="schedule table-striped col-lg-offset-3 col-lg-6"></table>');

    _.chain(parsedData).sortBy(function (element) {
      return moment(element.date).unix();
    }).map(function (row) {
      var templateRow = $(template({
        id:   row.id,
        job:  row.job,
        date: moment(row.date).format('dddd D MMMM HH:mm')
      }));

      templateRow.on('click', '.delete', function () {
        RSVP.Promise.cast($.post('/my_zwave/schedule/' + row.id + '/destroy'))
        .then(function () {
          templateRow.fadeOut().promise().then(function () {
            $(this).detach();

            restripeRows($scheduleTable);
          });
        });
      });

      return templateRow;
    }).each(function (templateRow) {
      $scheduleTable.append(templateRow);
    }).run();

    return $scheduleTable;

  }

  function scheduleAutoOff() {
    return RSVP.Promise.cast($.ajax({
      url: '/my_zwave/scheduled_tasks/new',
      data: {name: 'off', datetime: randomTime(23).toJSON()},
      type: 'POST'
    }))
    .then(function (jqXHR) {
      var json = JSON.parse(jqXHR);
      var date = moment(json.date);

      var displayableTime = date.format('HH:mm');

      userFeedback.addMessage('Scheduled off at ' + displayableTime);
    });
  }

  var publicMethods = {
    scheduleAutoOff: scheduleAutoOff,
    generateTable: generateTable
  };

  return publicMethods;
};
