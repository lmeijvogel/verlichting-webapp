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
      changeEventHandler(e.target.value);
    });

    return slider;
  }

  function createSwitch(value) {
    var switchContainer = document.createElement('label');

    switchContainer.className = 'mdl-switch mdl-js-switch mdl-js-ripple-effect';
    switchContainer.setAttribute('for', 'light-switch');

    var theSwitch = document.createElement('input');

    theSwitch.className = 'mdl-switch__input js-light-value';
    theSwitch.setAttribute('id', 'light-switch');
    theSwitch.setAttribute('type', 'checkbox');

    if (value) {
      theSwitch.setAttribute('checked', 'checked');
    }

    theSwitch.addEventListener('change', function (e) {
      changeEventHandler(e.target.checked);
    });

    switchContainer.appendChild(theSwitch);
    return switchContainer;
  }

  function show(lightName, value, onChange) {
    dialog.querySelector('.js-light-dialog-title').innerText = lightName;

    if (type == 'dim') {
      var slider = createSlider(parseInt(value, 10));
      var sliderContainer = dialog.querySelector('.js-slider-container');

      sliderContainer.appendChild(slider);
      window.componentHandler.upgradeElement(slider);
    } else {
      var theSwitch = createSwitch(value);
      var switchContainer = dialog.querySelector('.js-switch-container');

      switchContainer.appendChild(theSwitch);
      window.componentHandler.upgradeElement(theSwitch);
    }

    changeEventHandler = onChange;

    return new Promise(function (resolve, reject) {
      submitEventHandler = function () {
        dialog.close();

        if (type == 'dim') {
          resolve(slider.value);
          var mdlSliderContainer = sliderContainer.querySelector('.mdl-slider__container');

          sliderContainer.removeChild(mdlSliderContainer);
        } else {
          resolve(theSwitch.querySelector('.js-light-value').checked);
          var mdlSwitchContainer = switchContainer.querySelector('.mdl-switch');

          switchContainer.removeChild(mdlSwitchContainer);
        }
      };

      cancelEventHandler = function () {
        dialog.close();

        if (type == 'dim') {
          var mdlSliderContainer = sliderContainer.querySelector('.mdl-slider__container');

          sliderContainer.removeChild(mdlSliderContainer);
        } else {
          var mdlSwitchContainer = switchContainer.querySelector('.mdl-switch');

          switchContainer.removeChild(mdlSwitchContainer);
        }

        reject();
      };

      dialog.showModal();
    });
  }

  return {
    show: show
  };
};
