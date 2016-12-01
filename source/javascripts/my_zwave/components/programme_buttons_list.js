var Vue = window.Vue;

module.exports = Vue.component('programme-buttons-list', {
  props: ['programmes', 'activeProgrammeId'],
  computed: {
    loaded: function () { return this.programmes !== undefined; }
  },
  methods: {
    programmeRequested: function (programme) {
      this.$emit('programme-requested', programme);
    }
  },
  template: '' +
    '<div class="mdl-cell--12-col mdl-cell--4-col-desktop mdl-card mdl-shadow--2dp programme-buttons-list">' +
      '<div class="mdl-card__title">' +
        '<h3 class="mdl-card__title-text">Programma\'s</h3>' +
      '</div>' +
      '<div class="mdl-card__supporting-text">' +
        '<div v-if="!loaded" class="loading-spinner-container">' +
          '<div class="loading-spinner mdl-spinner mdl-js-spinner is-active"></div>' +
        '</div>' +
        '<div v-for="programme of programmes">' +
          '<programme-button ' +
            ':programme="programme" ' +
            ':active-programme-id="activeProgrammeId" ' +
            'v-on:selected="programmeRequested(programme)">' +
          '</programme-button>' +
        '</div>' +
      '</div>' +
    '</div>'
});
