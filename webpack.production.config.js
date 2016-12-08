module.exports = {
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.min.js'
    }
  },

  module: {
    loaders: [
      { test: /\.vue$/, loader: "vue-loader" }
    ]
  }
};
