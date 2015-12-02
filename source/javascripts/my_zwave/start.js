/*global programmesList, scheduledProgrammesList, lightValuesList, showLoginDialog, userFeedback */
$(function () {
  (function (programmesList, scheduledProgrammesList, lightValuesList, showLoginDialog, userFeedback) {
    var feedback = userFeedback($('.notice'), $('.error'));
    var programmesListInterface = programmesList(feedback);
    var scheduledProgrammes     = scheduledProgrammesList(feedback);
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
  })(programmesList, scheduledProgrammesList, lightValuesList, showLoginDialog, userFeedback);
});
