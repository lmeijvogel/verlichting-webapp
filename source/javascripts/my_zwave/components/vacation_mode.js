var Vue = window.Vue;

module.exports = Vue.component('vacation-mode', {
  props: ['state'],
  data: function () {
    return {
      defaultClasses: 'vacation-mode mdl-cell--12-col mdl-cell--4-col-desktop mdl-card mdl-shadow--2dp',
      newOnTime: null,
      newOffTime: null
    };
  },
  computed: {
    on: function () {
      return this.state && this.state.state == 'on';
    },
    off: function () {
      return !this.on;
    },
    startStopButtonLabel: function () {
      if (this.on) {
        return 'Stop';
      } else {
        return 'Start';
      }
    },
    title: function () {
      if (this.on) {
        return 'Vacation mode is <em>ON</em>';
      } else {
        return 'Vacation mode is <em>OFF</em>';
      };
    },
    titleClasses: function () {
      if (this.on) {
        return 'vacation-mode__on-title--active';
      }
    }
  },
  watch: {
    on: function () {
      this.newOnTime = this.state.start_time || '18:30';
      this.newOffTime = this.state.end_time || '22:30';
    }
  },
  methods: {
    buttonClicked: function () {
      if (this.on) {
        this.$emit('stop');
      } else {
        this.$emit('start', this.newOnTime, this.newOffTime);
      }
    }
  },
  template: '' +
    '<div :class="defaultClasses">' +
      '<div class="mdl-card__title" :class="titleClasses">' +
        '<h3 class="mdl-card__title-text" v-html="title"></h3>' +
      '</div>' +
      '<div class="mdl-card__supporting-text">' +
        '<div id="plan-vacation">' +
          '<p>Average on-time:' +
            '<input v-if="off" id="start-time" type="time" v-model="newOnTime" ' +
              'data-target="vacation-mode__start-time">' +
            '<span v-if="on">{{state.start_time}}</span>' +
          '<p>Average off-time:' +
            '<input v-if="off" id="end-time" type="time" v-model="newOffTime" data-target="vacation-mode__end-time">' +
            '<span v-if="on">{{state.end_time}}</span>' +
        '</div>' +
      '</div>' +
      '<div class="mdl-card__actions mdl-card__border">' +
        '<button v-on:click="buttonClicked" class="vacation-mode__start-stop-button ' +
            'mdl-button mdl-js-button mdl-js-ripple-effect">' +
          '{{startStopButtonLabel}}' +
        '</button>' +
      '</div>' +
    '</div>'
});

