module.exports = function (data) {
  var button = document.createElement('span');
  var valueDisplay = document.createElement('span');
  var nameDisplay = document.createElement('span');

  button.classList = 'mdl-chip mdl-cell--12-col mdl-cell--8-col-desktop mdl-cell--2-offset-desktop' +
                     ' light-button';
  valueDisplay.classList = 'mdl-chip__contact light-value';

  nameDisplay.classList = 'mdl-chip__text';
  nameDisplay.innerText = data.displayName;

  button.appendChild(valueDisplay);
  button.appendChild(nameDisplay);

  setValue(data.value);

  function setValue(value) {
    valueDisplay.innerText = lightValueToString(value);

    if (value === 'false' || value === '0') {
      button.classList.remove('mdl-color--amber-600');
      button.classList.add('mdl-color--blue-100');

      valueDisplay.classList.remove('mdl-color--yellow');
    } else {
      button.classList.remove('mdl-color--blue-100');
      button.classList.add('mdl-color--amber-600');

      valueDisplay.classList.add('mdl-color--yellow');
    }
  }

  function lightValueToString(value) {
    if (value === 'false' || value === '0') {
      return '-';
    }
    if (value === 'true') {
      return 'on';
    }

    return value;
  }

  return button;
}
