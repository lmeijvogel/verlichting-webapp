<template>
  <div class="mdl-card mdl-shadow--2dp mdl-cell--12-col">
    <div class="mdl-card__title">
      <h3 class="mdl-card__title-text">Latest events</h3>
    </div>
    <div class="js-latest-events mdl-card__supporting-text">
      <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">
        <thead>
          <tr>
            <th class="mdl-data-table__cell--non-numeric">Time</th>
            <th class="mdl-data-table__cell--non-numeric">Source</th>
            <th class="mdl-data-table__cell--non-numeric">Event</th>
            <th class="mdl-data-table__cell--non-numeric">Data</th>
          </tr>
        </thead>
        <event-row v-for="event in events" :data="event"></event-row>
      </table>
    </div>
  </div>
</template>

<script>
  var Vue = window.Vue;

  require('./event-row.vue');

  module.exports = Vue.component('latest-events', {
    props: ['events'],
  });
</script>
