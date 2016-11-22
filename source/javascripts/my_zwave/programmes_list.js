var foreach = require('lodash.foreach');
var keys = require('lodash.keys');
var map = require('lodash.map');

var getJSON = require('./get_json');
var post = require('./post');

module.exports = function () {
  function getProgrammes() {
    return getJSON('/my_zwave/available_programmes').then(function (json) {
      var programmes = json.availableProgrammes;

      return map(keys(programmes), function (id) {
        return {
          id: id,
          name: programmes[id]
        };
      });
    });
  }

  function selectProgramme(programmeName) {
    return post('/my_zwave/programme/' + programmeName + '/start');
  }

  var publicMethods = {
    selectProgramme:           selectProgramme,
    getProgrammes:             getProgrammes,
  };

  return publicMethods;
};
