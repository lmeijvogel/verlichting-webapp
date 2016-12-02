var foreach = require('lodash.foreach');
var keys = require('lodash.keys');

var getJSON = require('./get-json');
var post = require('./post');

module.exports = function () {
  function getProgrammes() {
    return getJSON('/my_zwave/available_programmes').then(function (json) {
      var programmes = json.availableProgrammes;

      return Object.keys(programmes).map(function (id) {
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
