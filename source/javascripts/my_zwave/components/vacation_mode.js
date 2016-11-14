var Vue = window.Vue;

require('./vacation_mode_times_selectors');

module.exports = Vue.component('vacation-mode', {
  data: function () {
    return {
      defaultClasses: 'mdl-cell--12-col mdl-cell--4-col-desktop mdl-card mdl-shadow--2dp'
    };
  },
  computed: {
    titleText: function () {
      return 'Vacation mode is <em>OFF</em>';
    },
    vacationModeOn: function () {
      return true;
    },
    vacationModeOff: function () {
      return !this.vacationModeOn;
    }
  },
  template: '' +
    '<div :class="defaultClasses">' +
      '<div class="mdl-card__title">' +
        '<h3 class="mdl-card__title-text" v-html="titleText"></h3>' +
      '</div>' +
      '<div class="mdl-card__supporting-text">' +
        '<vacation-mode-times-selectors v-if="vacationModeOff"></vacation-mode-time-selectors>' +
        '<vacation-mode-times-display v-if="vacationModeOn"></vacation-mode-time-display>' +
      '</div>' +
      '<div class="mdl-card__actions mdl-card__border">' +
        '<button class="vacation-mode__start-button mdl-button mdl-js-button mdl-js-ripple-effect" ' +
          'data-behavior="start-vacation">Start</button>' +
      '</div>' +
    '</div>'
});
