var RSVP = require('rsvp');

module.exports = function (dialog, type) {
  var submitEventHandler = function ()   { console.log('No event handler set for submitting the dialog'); };
  var cancelEventHandler = function ()   { console.log('No event handler set for cancelling the dialog'); };
  var changeEventHandler = function (e) { console.log('No event handler set for changing values', e); };

  dialog.querySelector('.submit').addEventListener('click', function () { submitEventHandler(); });
  dialog.querySelector('.cancel').addEventListener('click', function () { cancelEventHandler(); });

  function createSlider(value) {
    var slider = document.createElement('input');

    slider.className = 'mdl-slider mdl-js-slider js-light-value';
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '0');
    slider.setAttribute('max', '99');
    slider.setAttribute('value', value);

    slider.addEventListener('change', function (e) {
      if (type == 'dim') {
        changeEventHandler(e.target.value, 10);
      } else {
        var output = e.target.checked;

        changeEventHandler(output);
      }
    });

    return slider;
  }

  function show(lightName, value, onChange) {
    dialog.querySelector('.js-light-dialog-title').innerText = lightName;

    if (type == 'dim') {
      var slider = createSlider(value);
      var sliderContainer = dialog.querySelector('.js-slider-container');

      sliderContainer.appendChild(slider);
      window.componentHandler.upgradeElement(slider);
    } else {
      dialog.querySelector('.js-light-value').checked = value;
    }

    changeEventHandler = onChange;

    return new RSVP.Promise(function (resolve, reject) {
      submitEventHandler = function () {
        dialog.close();

        if (type == 'dim') {
          resolve(slider.value);
        } else {
          resolve(dialog.querySelector('.js-light-value').checked);
        }

        var mdlSliderContainer = sliderContainer.querySelector('.mdl-slider__container');

        sliderContainer.removeChild(mdlSliderContainer);
      };

      cancelEventHandler = function () {
        dialog.close();

        var mdlSliderContainer = sliderContainer.querySelector('.mdl-slider__container');

        sliderContainer.removeChild(mdlSliderContainer);

        reject();
      };

      dialog.showModal();
    });
  }

  return {
    show: show
  };
};
