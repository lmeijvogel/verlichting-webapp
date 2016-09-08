var foreach = require('lodash.foreach');
var map = require('lodash.map');
var keys = require('lodash.keys');

var lightValueChip = require('./light_value_chip');

var getJSON = require('./get_json');
var post = require('./post');

var createLightValueDialog = require('./create_light_value_dialog');

module.exports = function () {
  var lights = document.querySelector('#lights');
  var buttons = null;


  function update() {
    foreach(buttons, function (button) {
      button.setUnknown();
    });

    getJSON('/my_zwave/current_lights').then(function (data) {
      if (buttons == null) {
        createButtons(data);
      } else {
        updateButtons(data);
      }
    });
  }

  function createButtons(data) {
    buttons = {};

    var valueDialogElement = document.querySelector('.light-value-dialog');
    var switchDialogElement = document.querySelector('.light-switch-dialog');
    var lightValueDialog = createLightValueDialog(valueDialogElement, 'dim');
    var lightSwitchDialog = createLightValueDialog(switchDialogElement, 'switch');

    foreach(keys(data.lights), function (key) {
      var node = data.lights[key];
      var value;

      if (node.type == 'dim') {
        value = parseInt(node.value, 10);
      } else {
        value = node.value === true;
      }

      var displayName = key.substr(5);
      var light = lightValueChip(displayName, value);

      console.log('nodeValue at start: ', value);

      var changeHandler = function (newValue) {
        changeNode(light, newValue, node);
      };

      light.onClick(function () {
        var dialog;

        if (node.type == 'dim') {
          dialog = lightValueDialog;
        } else {
          dialog = lightSwitchDialog;
        }

        dialog.show(displayName, value, changeHandler).then(function (newValue) {
          changeNode(light, newValue, node);
        })
        .catch(function () {
          changeNode(light, value, node);
        });
      });

      buttons[key] = light;
    });

    foreach(buttons, function (button) {
      lights.appendChild(button.element);
    });
  }

  function updateButtons(data) {
    foreach(keys(data.lights), function (key) {
      var value = data.lights[key].value;
      var displayName = key.substr(5);

      buttons[key].setValue(value);
    });
  }

  function changeNode(light, newValue, node) {
    light.setValue(newValue);

    if (node.type == 'dim') {
      post('/my_zwave/light/' + node.node_id + '/level/' + newValue);
    } else {
      var onOff = newValue ? 'on' : 'off';

      post('/my_zwave/light/' + node.node_id + '/switch/' + onOff);
    }
  }


  var publicMethods = {
    update: update
  };

  return publicMethods;
};
