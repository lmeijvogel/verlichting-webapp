var _ = require('lodash');
var RSVP = require('rsvp');

var $post = require('jquery').post;
var $getJSON = require('jquery').getJSON;

module.exports = function ($selector) {
  function start() {
    RSVP.Promise.cast($getJSON('/my_zwave/last_actions')).then(function (data) {
      $selector.text(data);
    });
  }

  return {
    start: start
  };
};
