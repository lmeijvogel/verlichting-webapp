(function () {
  function getProgrammes() {
    return {
      'off':        'Off',
      'evening':    'Evening',
      'evening_tv': 'Evening_tv',
      'dimmed':     'Dimmed',
      'night':      'Night',
      'morning':    'Morning'
    };
  }

  function randomDate(mean) {
    // Pick a random time around the given mean hour.
    // E.g. if mean=23, the time will be chosen between
    // 22:30 and 23:30.
    var date = moment({hours: mean, minutes: 0});
    var random0to60 = Math.random() * 60;

    date.add('minutes', random0to60 - 30);

    return date;
  }

  var programmesList = function (programmes) {
    var programmeChosenHandlers = (function () {
      var programmeChangedListeners = [];

      var publicMethods = {
        subscribe: function (handler) {
          programmeChangedListeners.push(handler);
        },

        notify: function (newProgrammeId) {
          _.each(programmeChangedListeners, function (handler) {
            handler(newProgrammeId);
          });
        }
      };

      return publicMethods;
    })();

    function selectProgramme(programmeName) {
      return RSVP.Promise.cast(jQuery.post('/my_zwave/programme/' + programmeName + '/start'));
    }

    var programmeButtonTemplate = (function () {
      var buttonClasses = 'selectProgrammeButton btn btn-lg btn-default';
      var template = '<button type="button" class="' + buttonClasses + '">${programmeName}</button>';

      return _.template(template);
    })();

    function makeButtons(programmes) {
      return _.chain(programmes).keys().map(function (programmeId) {
        var programmeName = programmes[programmeId];

        return makeButton(programmeId, programmeName);
      }).value();
    }

    function makeButton(programmeId, programmeName) {
      var button = $(programmeButtonTemplate({programmeId: programmeId, programmeName: programmeName}));

      var buttonChanged = function (newProgrammeId) {
        button.removeClass('btn-danger');
        if (newProgrammeId == programmeId) {
          button.removeClass('btn-default').addClass('btn-primary');
        } else {
          button.removeClass('btn-primary').addClass('btn-default');
        }
      };

      programmeChosenHandlers.subscribe(buttonChanged);

      button.click(function () {
        selectProgramme(programmeId).then(function () {
          programmeChosenHandlers.notify(programmeId);
          clearError();
        }).catch(function (jqXHR) {
          button.removeClass('btn-default').addClass('btn-danger');

          setError(jqXHR.responseText);
        });
      });

      var $li = $('<li class="row"></li>');

      $li.append(button);
      return $li;
    }

    var makeButtonsList = function () {
      var buttons = makeButtons(programmes);
      var $ul = $('<ul class="programmes"></ul>');

      $ul.append(buttons);

      return $ul;
    };

    var publicMethods = {
      makeButtonsList:           makeButtonsList,
      subscribeProgrammeChanged: programmeChosenHandlers.subscribe,
      selectProgramme:           programmeChosenHandlers.notify
    };

    return publicMethods;
  };

  function showLoginDialog() {
    return new RSVP.Promise(function (resolve) {
      $('body').on('keyup', '.loginDialog input', function (data) {
        if (data.keyCode == 13) {
          tryPassword();
        }
      });

      $('body').on('click', '.loginDialog .submit', function () {
        tryPassword();
      });

      function tryPassword() {
        var username = $('.loginDialog #username').val();
        var password = $('.loginDialog #password').val();
        var request = $.post('/my_zwave/login/create', {username: username, password: password});

        RSVP.Promise.cast(request).then(function () {
          return hide();
        }).then(function () {
          resolve();
        });
      }

      function hide() {
        return new RSVP.Promise(function (resolve) {
          $('.loginDialog').fadeOut({complete: resolve});
        });
      }

      $('.loginDialog').fadeIn();
    });
  }

  $(function () {
    var programmesListInterface = programmesList(getProgrammes());
    var scheduledProgrammes     = scheduledProgrammesList();
    var currentValues           = lightValuesList();

    programmesListInterface.subscribeProgrammeChanged(function () {
      if (jQuery('#auto_off').is(':checked')) {
        scheduledProgrammes.scheduleAutoOff().then(function () {
          scheduledProgrammes.generateTable().then(function ($table) {
            jQuery('#schedule').html('');
            jQuery('#schedule').append($table);
          });
        });
      }
    });

    $('#programmeButtons').html('');
    $('#programmeButtons').append(programmesListInterface.makeButtonsList());
    scheduledProgrammes.generateTable().then(function ($table) {
      jQuery('#schedule').html('');
      jQuery('#schedule').append($table);
    });

    $('#lightsTitle').on('click', currentValues.show);

    function showData() {
      RSVP.Promise.cast(jQuery.getJSON('/my_zwave/current_programme'))
      .then(function (data) {
        programmesListInterface.selectProgramme(data.programme);
      })
      .catch(function (jqXHR) {
        if (jqXHR.status == 401) {
          showLoginDialog().then(function () {
            showData();
          });
        }
      });

      currentValues.show();
    }

    showData();
  });

  function setError(error) {
    $('.error').text(error).slideDown();
  }

  function setNotice(notice) {
    $('.notice').text(notice).slideDown();
  }

  function clearError() {
    $('.error').fadeOut().text('');
  }

  function clearNotice() {
    $('.notice').fadeOut().text('');
  }

  function scheduledProgrammesList() {
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
      var $scheduleTable = jQuery('<table class="schedule table-striped col-lg-offset-3 col-lg-6"></table>');

      return RSVP.Promise.cast(jQuery.get('/my_zwave/scheduled_tasks/list'))
        .then(function (data) {
          _.chain(JSON.parse(data)).sortBy(function (element) {
            return moment(element.date).unix();
          }).map(function (row) {
            var templateRow = $(template({
              id:   row.id,
              job:  row.job,
              date: moment(row.date).format('dddd D MMMM HH:mm')
            }));

            templateRow.on('click', '.delete', function () {
              RSVP.Promise.cast(jQuery.post('/my_zwave/schedule/' + row.id + '/destroy'))
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
        })
        .catch(function () {
          //TODO
        });
    };

    function scheduleAutoOff() {
      return RSVP.Promise.cast(jQuery.ajax({
        url: '/my_zwave/scheduled_tasks/new',
        data: {name: 'off', datetime: randomDate(23).toJSON()},
        type: 'POST'
      }))
      .then(function (jqXHR) {
        var json = JSON.parse(jqXHR);
        var date = moment(json.date);

        var displayableTime = date.format('HH:mm');

        setNotice('Scheduled off at ' + displayableTime);
      });
    }

    var publicMethods = {
      scheduleAutoOff: scheduleAutoOff,
      generateTable: generateTable
    };

    return publicMethods;
  }

  function lightValuesList() {
    var $lights = jQuery('#lights');

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

      RSVP.Promise.cast(jQuery.getJSON('/my_zwave/current_lights'))
        .then(function (data) {
          var lights = data.lights;
          var table = jQuery('<table class="table table-striped">');

          _.chain(lights).keys().map(function (key) {
            var light = lights[key];
            var value = lightValueToString(light.value);

            return '<tr><td>' + key.substr(5) + '</td><td>' + value + '</td></tr>';
          }).each(function (rowHtml) {
            table.append(jQuery(rowHtml));
          }).run();

          $lights.append(table);
        });
    }

    var publicMethods = {
      show: show
    };

    return publicMethods;
  }
})();
