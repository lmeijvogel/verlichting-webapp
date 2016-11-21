var Vue = window.Vue;

var lightValueChip = require('./light_value_chip');
var createLightValueDialog = require('../create_light_value_dialog');

// Is this a smell?
var post = require('../post');

module.exports = Vue.component('lights-list', {
  props: ['lights'],
  template: '' +
'    <div class="mdl-card mdl-shadow--2dp mdl-cell--12-col mdl-cell--4-col-desktop light-values-table">' +
'      <div class="mdl-card__title">' +
'        <h3 class="mdl-card__title-text js-reload-lights">Lichten</h3>' +
'      </div>' +
'      <div id="lights" class="mdl-card__supporting-text">' +
'        <div v-for="light of lights">' +
'          <light-value-chip v-bind:name="light.name" v-bind:node-id="light.nodeId"' +
                           ' v-bind:value="light.value" v-on:click="changeLightValue(light)"></light-value-chip>' +
'      </div>' +
'    </div>',
  methods: {
    changeLightValue: function (light) {
      var valueDialogElement = document.querySelector('.light-value-dialog');
      var switchDialogElement = document.querySelector('.light-switch-dialog');
      var lightValueDialog = createLightValueDialog(valueDialogElement, 'dim');
      var lightSwitchDialog = createLightValueDialog(switchDialogElement, 'switch');

      var dialog;
      var valueForDialog; // Should be done by the light itself
      var oldValue = light.value;

      if (light.type == 'dim') {
        dialog = lightValueDialog;
        valueForDialog = parseInt(light.value, 10)
      } else {
        dialog = lightSwitchDialog;
        valueForDialog = light.value == "true";
      }

      dialog.show(light.name, valueForDialog, function (value) { light.value = value; })
        .then(function (newValue) {
          if (light.type == 'dim') {
            return post('/my_zwave/light/' + light.nodeId + '/level/' + newValue);
          } else {
            var onOff = newValue ? 'on' : 'off';

            return post('/my_zwave/light/' + light.nodeId + '/switch/' + onOff).then( function () {
              return newValue;
            });
          }
        })
        .then(function (newValue) {
          light.value = newValue;
        })
        .catch(function () {
          light.value = oldValue;
        });
    }
  }
});
