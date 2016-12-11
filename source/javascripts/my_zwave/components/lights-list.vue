<template>
  <div class="mdl-card mdl-shadow--2dp mdl-cell--12-col mdl-cell--4-col-desktop light-values-table">
    <div @click="titleClicked" class="mdl-card__title">
      <h3 class="mdl-card__title-text">Lichten</h3>
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
  var Vue = require('vue');

  var lightValueChip = require('./light-value-chip.vue');
  var createLightValueDialog = require('../create-light-value-dialog');
  var nodeValueTranslator = require('../node-value-translator')();

  module.exports = Vue.component('lights-list', {
    data: function () {
      return {
        lights: null
      };
    },
    mounted: function () {
      this.loadLights();
    },
    methods: {
      loadLights: function () {
        this.$http.get('/my_zwave/current_lights').then(function (response) {
          return response.json();
        }).then(function (json) {
          this.lights = Object.keys(json.lights).map(function (name) {
            var row = json.lights[name];
            var light = {nodeId: row.node_id, name: name, type: row.type};

            light.value = nodeValueTranslator.fromServer(row.value, light);

            return light;
          });
        });
      },
      changeLightValue: function (light) {
        var self = this;

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
              request = self.$http.post('/my_zwave/light/' + light.nodeId + '/level/' + valueAsParam);
            } else {
              request = self.$http.post('/my_zwave/light/' + light.nodeId + '/switch/' + valueAsParam);
            }

            request.then(function () {
              light.value = newValue;
            });
          })
          .catch(function (e) {
            console.error("Error saving light value:");
            console.error(e);
            light.value = oldValue;
          });
      },

      titleClicked: function () {
        this.loadLights();
      }
    }
  });
</script>
