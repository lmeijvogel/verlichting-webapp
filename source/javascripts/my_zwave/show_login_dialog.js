var RSVP = require('rsvp');
var post = require('./post');

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
      var username = dialog.querySelector('#username').value;
      var password = dialog.querySelector('#password').value;
      var request = post('/my_zwave/login/create', {username: username, password: password});

      return request.then(function () {
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
