var foreach = require('lodash.foreach');
var map = require('lodash.map');
var keys = require('lodash.keys');

var lightValueChip = require('./light_value_chip');

var getJSON = require('./get_json');

var createLightValueDialog = require('./create_light_value_dialog');
var createNode = require('./create_node');

module.exports = function () {
  var lightsElement = document.querySelector('#lights');
  var nodes;

  function create() {
    getJSON('/my_zwave/current_lights').then(function (data) {
      createButtons(data);
    });
  }

  function update() {
    foreach(nodes, function (node) {
      node.setUnknown();
    });

    getJSON('/my_zwave/current_lights').then(function (data) {
      updateNodes(data);
    });
  }

  function createButtons(data) {
    nodes = {};

    var valueDialogElement = document.querySelector('.light-value-dialog');
    var switchDialogElement = document.querySelector('.light-switch-dialog');
    var lightValueDialog = createLightValueDialog(valueDialogElement, 'dim');
    var lightSwitchDialog = createLightValueDialog(switchDialogElement, 'switch');

    foreach(keys(data.lights), function (key) {
      var node = createNode(data.lights[key]);

      var displayName = key.substr(5);
      var lightChip = lightValueChip(displayName, node.getValue());

      node.onChange(lightChip.setValue);

      var changeHandler = node.setValue;

      lightChip.onClick(function () {
        var dialog;
        var oldValue = node.getValue();

        if (node.type == 'dim') {
          dialog = lightValueDialog;
        } else {
          dialog = lightSwitchDialog;
        }

        dialog.show(displayName, node.getValue(), changeHandler).then(node.setValue)
        .catch(function () {
          node.setValue(oldValue);
        });
      });

      nodes[key] = node;

      lightsElement.appendChild(lightChip.element);
    });
  }

  function updateNodes(data) {
    foreach(keys(data.lights), function (key) {
      nodes[key].updateFromServer(data.lights[key]);
    });
  }

  var publicMethods = {
    create: create,
    update: update
  };

  return publicMethods;
};
