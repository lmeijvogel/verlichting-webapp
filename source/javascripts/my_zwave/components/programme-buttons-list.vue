<template>
  <div class="mdl-cell--12-col mdl-cell--4-col-desktop mdl-card mdl-shadow--2dp programme-buttons-list">
    <div class="mdl-card__title">
      <h3 class="mdl-card__title-text">Programma's</h3>
    </div>
    <div class="mdl-card__supporting-text">
      <div v-if="!loaded" class="loading-spinner-container">
        <div class="loading-spinner mdl-spinner mdl-js-spinner is-active"></div>
      </div>
      <div v-for="programme of programmes">
        <programme-button 
          :programme="programme" 
          :active-programme-id="activeProgrammeId" 
          @selected="programmeRequested(programme)">
        </programme-button>
      </div>
    </div>
  </div>
</template>

<script>
  var Vue = require('vue');

  require('./programme-button.vue');

  module.exports = Vue.component('programme-buttons-list', {
    data: function () {
      return {
        programmes: null,
        activeProgrammeId: null
      };
    },
    computed: {
      loaded: function () { return this.programmes !== undefined; }
    },
    mounted: function () {
      this.loadProgrammes().then(function () {
        this.loadCurrentProgramme();
      });
    },
    methods: {
      programmeRequested: function (programme) {
        this.selectProgramme(programme.id).then(function () {
          this.activeProgrammeId = programme.id;
        }).catch(function (error) {
          var errorMessage;

          if (error && error.responseText) {
            errorMessage = error.responseText;
          } else {
            errorMessage = 'Kon programma niet selecteren.';
          }

          // TODO: Check whether this is the correct 'this' due to possibly changing
          // value of 'this' inside this promise handler.
          this.$emit('error', errorMessage);
        });
      },

      loadProgrammes: function () {
        return this.$http.get('/my_zwave/available_programmes').then(function (response) {
          return response.json();
        }).then(function (json) {
          this.programmes = Object.keys(json.availableProgrammes).map(function (id) {
            return {
              id: id,
              name: json.availableProgrammes[id]
            };
          });
        });
      },

      loadCurrentProgramme: function () {
        this.$http.get('/my_zwave/current_programme')
          .then(function (response) {
            return response.json();
          }).then(function (data) {
            this.activeProgrammeId = data.programme;
          });
      },
      selectProgramme: function (programmeName) {
        return this.$http.post('/my_zwave/programme/' + programmeName + '/start');
      }
    },
  });
</script>
