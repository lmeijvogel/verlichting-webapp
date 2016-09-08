module.exports = function (displayName, value) {
  var element = document.createElement('span');
  var valueDisplay = document.createElement('span');
  var nameDisplay = document.createElement('span');

  var onClickHandler = function () { };

  element.classList = 'mdl-chip mdl-cell--12-col mdl-cell--8-col-desktop mdl-cell--2-offset-desktop' +
                     ' light-button';
  valueDisplay.classList = 'mdl-chip__contact light-value';

  nameDisplay.classList = 'mdl-chip__text';
  nameDisplay.innerText = displayName;

  element.appendChild(valueDisplay);
  element.appendChild(nameDisplay);

  element.addEventListener('click', function () {
    onClickHandler();
  });

  setValue(value);

  function setValue(value) {
    clearStyling();

    valueDisplay.innerText = lightValueToString(value);

    if (value === 0 || value === false) {
      element.classList.add('mdl-color--blue-100');
    } else {
      element.classList.add('mdl-color--amber-600');

      valueDisplay.classList.add('mdl-color--yellow');
    }
  }

  function setUnknown() {
    clearStyling();

    valueDisplay.innerText = '?';
  }

  function clearStyling() {
    element.classList.remove('mdl-color--amber-600');
    element.classList.remove('mdl-color--blue-100');

    valueDisplay.classList.remove('mdl-color--yellow');
  }

  function onClick(handler) {
    onClickHandler = handler;
  }

  function lightValueToString(value) {
    if (value === 0 || value === false) {
      return '-';
    } else if (value === true) {
      return 'on';
    } else {
      return value;
    }
  }

  return {
    element: element,
    setUnknown: setUnknown,
    setValue: setValue,
    onClick: onClick
  };
};
