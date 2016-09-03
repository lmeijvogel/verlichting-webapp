var RSVP = require('rsvp');
var $ = window.jQuery;

module.exports = function () {
  return new RSVP.Promise(function (resolve) {
    var dialog = document.querySelector('.login-dialog');

    var inputs = dialog.querySelectorAll('input');

    inputs.forEach(function (input) {
      input.addEventListener('keyup', function (data) {
        if (data.keyCode == 13) {
          tryPassword().then(resolve);
        }
      });
    });

    dialog.querySelector('.submit').addEventListener('click', function () {
      tryPassword().then(resolve);
    });

    function tryPassword() {
      var username = $('.login-dialog #username').val();
      var password = $('.login-dialog #password').val();
      var request = $.post('/my_zwave/login/create', {username: username, password: password});

      return RSVP.Promise.cast(request).then(function () {
        hide();
        return resolve();
      });
    }

    function hide() {
      dialog.close();
    }

    dialog.showModal();
  });
};
