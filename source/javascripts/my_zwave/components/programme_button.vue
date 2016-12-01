<template>
  <div @click="click" :class="[defaultClasses, activeClasses]">{{programme.name}}</div>
</template>

<script>
  var Vue = window.Vue;

  module.exports = Vue.component('programme-button', {
    data: function () {
      return {
        defaultClasses: 'selectProgrammeButton' +
                        ' mdl-button mdl-js-button mdl-js-ripple-effect' +
                        ' mdl-cell--12-col mdl-cell--8-col-desktop mdl-cell--2-offset-desktop'
      };
    },
    props: ['programme', 'activeProgrammeId'],
    computed: {
      active: function () {
        return this.programme.id == this.activeProgrammeId;
      },

      activeClasses: function () {
        if (this.active) {
          return 'mdl-button--raised mdl-button--colored';
        }
      }
    },

    methods: {
      click: function () {
        this.$emit('selected');
      }
    }
  });
</script>
