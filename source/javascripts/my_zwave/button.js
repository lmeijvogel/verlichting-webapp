var createButton = function (programmeName) {
  var buttonClasses = 'selectProgrammeButton' +
                      ' mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect' +
                      ' mdl-cell--12-col mdl-cell--8-col-desktop mdl-cell--2-offset-desktop';

  var button = document.createElement('button');

  button.type = 'button';
  button.classList = buttonClasses;
  button.innerText = programmeName;

  return button;
};

module.exports = function (programmeId, programmeName) {
  var button = createButton(programmeName);
  var clickHandler = function () {};

  function newProgrammeChosen(newProgrammeId) {
    button.classList.remove('mdl-button--accent');
    if (newProgrammeId == programmeId) {
      button.classList.add('mdl-button--colored');
    } else {
      button.classList.remove('mdl-button--colored');
    }
  };

  function onClick(handler) {
    clickHandler = handler;
  }

  button.addEventListener('click', function (e) {
    clickHandler(e);
  });

  return {
    element: button,
    onClick: onClick,
    newProgrammeChosen: newProgrammeChosen
  };
};
