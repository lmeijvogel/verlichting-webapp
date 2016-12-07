module.exports = {
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.js'
    }
  },

  module: {
    loaders: [
      { test: /\.vue$/, loader: "vue-loader" }
    ]
  }
};
