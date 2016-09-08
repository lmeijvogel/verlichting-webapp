var RSVP = require('rsvp');

module.exports = function (dialog, type) {
  var submitEventHandler = function ()   { console.log('No event handler set for submitting the dialog'); };
  var cancelEventHandler = function ()   { console.log('No event handler set for cancelling the dialog'); };
  var changeEventHandler = function (e) { console.log('No event handler set for changing values', e); };

  dialog.querySelector('.submit').addEventListener('click', function () { submitEventHandler(); });
  dialog.querySelector('.cancel').addEventListener('click', function () { cancelEventHandler(); });
  dialog.querySelector('.js-light-value').addEventListener('change', function (e) {
    if (type == 'dim') {
      changeEventHandler(e.target.value, 10);
    } else {
      var output = e.target.checked;

      changeEventHandler(output);
    }
  });

  function show(lightName, value, onChange) {
    dialog.querySelector('.js-light-dialog-title').innerText = lightName;

    if (type == 'dim') {
      dialog.querySelector('.js-light-value').value = value;
      dialog.querySelector('.js-light-value').setAttribute('value', value);
    } else {
      dialog.querySelector('.js-light-value').checked = value;
      //dialog.querySelector('.js-light-value').setAttribute('checked', value);
    }

    changeEventHandler = onChange;

    return new RSVP.Promise(function (resolve, reject) {
      submitEventHandler = function () {
        dialog.close();

        if (type == 'dim') {
          resolve(dialog.querySelector('.js-light-value').value);
        } else {
          resolve(dialog.querySelector('.js-light-value').checked);
        }
      };

      cancelEventHandler = function () {
        dialog.close();

        reject();
      };

      dialog.showModal();
    });
  }

  return {
    show: show
  };
};
