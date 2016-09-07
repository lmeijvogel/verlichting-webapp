var RSVP = require('rsvp');
var foreach = require('lodash.foreach');
var map = require('lodash.map');
var keys = require('lodash.keys');

var lightValueChip = require('./light_value_chip');

var getJSON = require('./get_json');
var post = require('./post');

var lightValueDialog = function () {
  var element = document.querySelector('.light-value-dialog');

  var closeEventHandler = function () { console.log("No event handler set for closing the dialog"); };

  element.querySelector('.close').addEventListener('click', function () { closeEventHandler() });

  function show(lightName, value) {
    element.querySelector('.js-light-dialog-title').innerText = lightName;
    element.querySelector('.js-light-value').value = value;

    return new RSVP.Promise(function (resolve, reject) {
      closeEventHandler = function () {
        element.close();

        resolve(element.querySelector(".js-light-value").value);
      };

      element.showModal();
    });
  }

  return {
    show: show
  };
};

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

    var theLightValueDialog = lightValueDialog();

    foreach(keys(data.lights), function (key) {
      var value = data.lights[key];
      var displayName = key.substr(5);
      var light = lightValueChip(displayName, value.value);
      light.onClick(function () {
        theLightValueDialog.show(displayName, value.value).then( function (newValue) {
          light.setValue(newValue);
          post('/my_zwave/light/' + value.node_id + '/level/' + newValue);
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

  var publicMethods = {
    update: update
  };

  return publicMethods;
};
