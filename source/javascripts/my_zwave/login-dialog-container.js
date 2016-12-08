var Vue = require('vue');

require('./components/login-dialog.vue');

module.exports = new Vue({
  el: '#login-dialog',
  props: ['visible'],
  methods: {
    loginSucceeded: function () {
      this.$emit('login-succeeded');
    },
    loginFailed: function () {
      this.$emit('login-failed');
    }
  }
});
