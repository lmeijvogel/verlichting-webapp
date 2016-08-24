var $ = require('jquery');
var _ = require('lodash');

var programmeButtonTemplate = (function () {
  var buttonClasses = 'selectProgrammeButton btn btn-lg btn-default';
  var template = '<button type="button" class="' + buttonClasses + '">${programmeName}</button>';

  return _.template(template);
})();

module.exports = function (programmeId, programmeName) {
  var button = $(programmeButtonTemplate({programmeName: programmeName}));
  var clickHandler = function () {};

  function newProgrammeChosen(newProgrammeId) {
    button.removeClass('btn-danger');
    if (newProgrammeId == programmeId) {
      button.removeClass('btn-default').addClass('btn-primary');
    } else {
      button.removeClass('btn-primary').addClass('btn-default');
    }
  };

  function onClick(handler) {
    clickHandler = handler;
  }

  button.click(function (e) {
    clickHandler(e);
  });

  var $li = $('<li class="row"></li>');

  $li.append(button);

  return {
    element: $li,
    onClick: onClick,
    newProgrammeChosen: newProgrammeChosen
  };
};
