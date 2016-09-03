var $ = window.jQuery;

var programmeButtonTemplate = function (programmeName) {
  var buttonClasses = 'selectProgrammeButton mdl-button mdl-cell--12-col mdl-cell--8-col-desktop mdl-cell--2-offset-desktop' +
                      ' mdl-js-button mdl-button--raised mdl-js-ripple-effect';

  return '<button type="button" class="' + buttonClasses + '">' + programmeName + '</button>';
};

module.exports = function (programmeId, programmeName) {
  var button = $(programmeButtonTemplate(programmeName));
  var clickHandler = function () {};

  function newProgrammeChosen(newProgrammeId) {
    button.removeClass('mdl-button--accent');
    if (newProgrammeId == programmeId) {
      button.addClass('mdl-button--colored');
    } else {
      button.removeClass('mdl-button--colored');
    }
  };

  function onClick(handler) {
    clickHandler = handler;
  }

  button.click(function (e) {
    clickHandler(e);
  });

  return {
    element: button,
    onClick: onClick,
    newProgrammeChosen: newProgrammeChosen
  };
};
