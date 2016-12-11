<template>
  <dialog @keyup="tryLoginIfEnter" class="mdl-dialog login-dialog" tabindex="-1" role="dialog" 
      aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="mdl-dialog__title">Please login</div>
    <div class="mdl-dialog__content">
      <div class="mdl-textfield mdl-js-textfield">
        <input type="text" id="username" name="username" class="mdl-textfield__input" v-model="username"/>
        <label for="username" class="mdl-textfield__label">Username</label>
      </div>
      <div class="mdl-textfield mdl-js-textfield">
        <input type="password" id="password" name="password" class="mdl-textfield__input" v-model="password"/>
        <label for="password" class="mdl-textfield__label">Password</label>
      </div>
    </div>
    <div class="mdl-dialog__actions">
      <button type="button" @click="tryLogin" class="mdl-button mdl-js-button submit">Submit</button>
    </div>
  </dialog>
</template>

<script>
  var Vue = require('vue');

  module.exports = Vue.component('login-dialog', {
    props: ['visible'],

    data: function () {
      return {
        username: 'lennaert',
        password: 'jajadus'
      };
    },
    methods: {
      tryLogin: function () {
        var request = this.$http.post('/my_zwave/login/create', {username: this.username, password: this.password});
        var self = this;

        request.then(function () {
          self.$emit('login-succeeded');
          self.$el.close();
        }).catch(function (e) {
          var message;

          if (e && e.status == 401) {
            message = 'Invalid username or password';
          } else {
            message = 'Could not log in for unknown reasons';
          }

          console.error(e);
          self.$emit('login-failed', message);
        });
      },

      tryLoginIfEnter: function (e) {
        if (e.keyCode == 13) {
          this.tryLogin();
        }
      }
    },
    watch: {
      visible: function () {
        var self = this;

        if (self.visible) {
          Vue.nextTick(function () {
            self.$el.showModal();
          }, 0);
        }
      }
    }
  });
</script>
