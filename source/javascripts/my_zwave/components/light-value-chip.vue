<template>
  <span @click="click" :class="[defaultClasses, chipStateClasses]">
    <span :class="valueClasses">{{displayValue}}</span>
    <span class="mdl-chip__text">{{displayName}}</span>
  </span>
</template>

<script>
  var Vue = window.Vue;

  module.exports = Vue.component('light-value-chip', {
    props: ['name', 'value', 'nodeId'],
    data: function () {
      return {
        defaultClasses: 'mdl-chip mdl-cell--12-col mdl-cell--8-col-desktop mdl-cell--2-offset-desktop light-button'
      };
    },
    computed: {
      isOff: function () {
        return this.value === 0 || this.value === '?' || this.value === false;
      },
      isOn: function () {
        return !this.isOff;
      },
      chipStateClasses: function () {
        if (this.isOn) {
          return 'mdl-color--amber-600';
        } else {
          return 'mdl-color--blue-100';
        }
      },
      valueClasses: function () {
        var defaultClasses = 'mdl-chip__contact light-value';

        if (this.isOn) {
          return defaultClasses + ' mdl-color--yellow';
        } else {
          return defaultClasses;
        }
      },
      displayName: function () {
        return this.name.substr(5);
      },

      displayValue: function () {
        if (this.value === 0 || this.value === false) {
          return '-';
        } else if (this.value === true) {
          return 'on';
        } else {
          return this.value;
        }
      }
    },

    methods: {
      click: function () {
        this.$emit('click');
      }
    }
  });
</script>
