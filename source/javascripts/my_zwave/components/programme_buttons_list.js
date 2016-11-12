var Vue = window.Vue;

module.exports = Vue.component('programme-buttons-list', {
  template: '#programme-buttons-list',
  props: ['programmes', 'activeProgrammeId'],
  computed: {
    loaded: function () { return this.programmes !== undefined; }
  },
  methods: {
    programmeRequested: function (programme) {
      this.$emit('programme-requested', programme);
    }
  }
});
