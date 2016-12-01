<template>
  <div class="mdl-card mdl-shadow--2dp mdl-cell--12-col mdl-cell--4-col-desktop light-values-table">
    <div @click="titleClicked" class="mdl-card__title">
      <h3 class="mdl-card__title-text js-reload-lights">Lichten</h3>
    </div>
    <div id="lights" class="mdl-card__supporting-text">
    <div v-for="light of lights">
      <light-value-chip :name="light.name"
                        :node-id="light.nodeId"
                        :value="light.value"
                        @click="changeLightValue(light)"></light-value-chip>
    </div>
  </div>
</template>

<script>
  var Vue = window.Vue;

  var lightValueChip = require('./light_value_chip.vue');
  var createLightValueDialog = require('../create_light_value_dialog');
  var nodeValueTranslator = require('../node_value_translator')();

  // Is this a smell?
  var post = require('../post');

  module.exports = Vue.component('lights-list', {
    props: ['lights'],
    methods: {
      changeLightValue: function (light) {
        // Initialize these dialogs only once
        this.valueDialogElement = this.valueDialogElement || document.querySelector('.light-value-dialog');
        this.switchDialogElement = this.switchDialogElement || document.querySelector('.light-switch-dialog');
        this.lightValueDialog = this.lightValueDialog || createLightValueDialog(this.valueDialogElement, 'dim');
        this.lightSwitchDialog = this.lightSwitchDialog || createLightValueDialog(this.switchDialogElement, 'switch');

        var dialog;

        if (light.type == 'dim') {
          dialog = this.lightValueDialog;
        } else {
          dialog = this.lightSwitchDialog;
        }

        var valueForDialog = nodeValueTranslator.fromServer(light.value, light); // Should be done at light load time
        var oldValue = light.value;

        dialog.show(light.name, valueForDialog, function (value) { light.value = value; })
          .then(function (newValue) {
            var request;

            var valueAsParam = nodeValueTranslator.toServer(newValue, light);

            if (light.type == 'dim') {
              request = post('/my_zwave/light/' + light.nodeId + '/level/' + valueAsParam);
            } else {
              request = post('/my_zwave/light/' + light.nodeId + '/switch/' + valueAsParam);
            }

            request.then(function () {
              light.value = newValue;
            });
          })
          .catch(function () {
            light.value = oldValue;
          });
      },

      titleClicked: function () {
        this.$emit('reload-requested');
      }
    }
  });
</script>
