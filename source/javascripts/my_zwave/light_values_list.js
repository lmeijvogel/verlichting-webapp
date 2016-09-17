var foreach = require('lodash.foreach');
var map = require('lodash.map');
var keys = require('lodash.keys');

var lightValueChip = require('./light_value_chip');

var getJSON = require('./get_json');

var createLightValueDialog = require('./create_light_value_dialog');
var createNode = require('./create_node');

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
      var node = createNode(data.lights[key]);

      var displayName = key.substr(5);
      var light = lightValueChip(displayName, node.getValue());

      var changeHandler = function (newValue) {
        changeNode(light, newValue, node);
      };

      light.onClick(function () {
        var dialog;
        var oldValue = node.getValue();

        if (node.type == 'dim') {
          dialog = lightValueDialog;
        } else {
          dialog = lightSwitchDialog;
        }

        dialog.show(displayName, node.getValue(), changeHandler).then(function (newValue) {
          changeNode(light, newValue, node);
        })
        .catch(function () {
          changeNode(light, oldValue, node);
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
      var value = createNode(data.lights[key]).getValue();
      var displayName = key.substr(5);

      buttons[key].setValue(value);
    });
  }

  function changeNode(light, newValue, node) {
    var promise = node.updateValue(newValue);

    promise.then(function () {
      light.setValue(node.getValue());
    });
  }


  var publicMethods = {
    update: update
  };

  return publicMethods;
};
