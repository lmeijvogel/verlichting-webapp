var RSVP = require('rsvp');
var $ = require('jquery');
var _ = require('lodash');

module.exports = function () {
  return new RSVP.Promise(function (resolve) {
    $('body').on('keyup', '.loginDialog input', function (data) {
      if (data.keyCode == 13) {
        tryPassword();
      }
    });

    $('body').on('click', '.loginDialog .submit', function () {
      tryPassword();
    });

    function tryPassword() {
      var username = $('.loginDialog #username').val();
      var password = $('.loginDialog #password').val();
      var request = $.post('/my_zwave/login/create', {username: username, password: password});

      RSVP.Promise.cast(request).then(function () {
        return hide();
      }).then(function () {
        resolve();
      });
    }

    function hide() {
      return new RSVP.Promise(function (resolve) {
        $('.loginDialog').fadeOut({complete: resolve});
      });
    }

    $('.loginDialog').fadeIn();
  });
};
