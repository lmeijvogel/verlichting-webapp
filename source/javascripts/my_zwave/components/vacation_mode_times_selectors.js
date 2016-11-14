var Vue = window.Vue;

module.exports = Vue.component('vacation-mode-times-selectors', {
  template: '<div>' +
              '<p>Average on-time:' +
                '<input id="start-time" type="time" value="18:30" data-target="vacation-mode__start-time">' +
              '<p>Average off-time:' +
                '<input id="end-time" type="time" value="22:30" data-target="vacation-mode__end-time">' +
            '</div>'
});
