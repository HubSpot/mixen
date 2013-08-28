module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    coffee:
      compile:
        files:
          'mixen.js': 'mixen.coffee'
          'spec/mixen.spec.js': 'spec/mixen.spec.coffee'

    watch:
      coffee:
        files: ['mixen.coffee', 'spec/mixen.spec.coffee']
        tasks: ["coffee", "uglify"]

    uglify:
      options:
        banner: "/*! <%= pkg.name %> <%= pkg.version %> */\n"

      dist:
        src: 'mixen.js'
        dest: 'mixen.min.js'

    jasmine:
      options:
        specs: ['spec/mixen.spec.js']
      src: 'mixen.js'

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-jasmine'

  grunt.registerTask 'default', ['coffee', 'uglify']
  grunt.registerTask 'build', ['coffee', 'uglify', 'jasmine']
  grunt.registerTask 'test', ['coffee', 'uglify', 'jasmine']
