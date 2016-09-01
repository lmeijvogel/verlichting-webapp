var $ = window.jQuery;

var programmeButtonTemplate = function (programmeName) {
  var buttonClasses = 'selectProgrammeButton mdl-button mdl-cell--4-col mdl-cell--4-offset mdl-js-button mdl-button--raised mdl-js-ripple-effect';
  var template = '<button type="button" class="' + buttonClasses + '">' + programmeName + '</button>';

  return template;
};

module.exports = function (programmeId, programmeName) {
  var button = $(programmeButtonTemplate(programmeName));
  var clickHandler = function () {};

  function newProgrammeChosen(newProgrammeId) {
    button.removeClass('mdl-button--accent');
    if (newProgrammeId == programmeId) {
      button.removeClass('btn-default').addClass('mdl-button--primary');
    } else {
      button.removeClass('mdl-button--primary').addClass('btn-default');
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
