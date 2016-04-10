module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      main: {
        files: [
          {cwd: 'source/', src: ['javascripts/bootstrap.min.js'], dest: 'site/', expand: true },
          {cwd: 'source/', src: ['index.html'], dest: 'site/', expand: true },
          {cwd: 'source/', src: ['stylesheets/*.css'], dest: 'site/', nonull: true, expand: true },
          {cwd: 'source/', src: ['images/*'], dest: 'site/', nonull: true, expand: true },
        ]
      },

      nonUglified: {
        files: [
          {cwd: 'tmp/', src: ['my_zwave.js'], dest: 'site/javascripts', expand: true}
        ]
      }
    },
    eslint: {
      src: ["source/javascripts/my_zwave/*.js"]
    },
    browserify: {
      'tmp/my_zwave.js': ['source/javascripts/my_zwave/start.js']
    },
    uglify: {
      options: {
        banner: '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      my_target: {
        files: {  'site/javascripts/my_zwave.js': ['tmp/my_zwave.js'] }
      }
    },

    watch: {
      files:
        [
          'source/**/*'
        ],
      tasks: ['default']
    },

    clean: ['site/']
  });

  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build',   ['clean', 'copy', 'eslint', 'browserify', 'uglify']);
  grunt.registerTask('default', [         'copy', 'eslint', 'browserify', 'copy:nonUglified']);
};
