module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /**
     * Clean the cache busted files
     */
    clean: {
      js: ["src/js/dist/*.*.*.js"],
      css: ["src/css/*.*.css"]
    },

    /**
     * Concatenate all source files
     */
    concat: {
      options: { separator: '\n' },
      build: {
        src: ['src/js/*.js'],
        dest: 'src/js/dist/<%= pkg.name %>.js'
      },
    },


    /**
     * Minify the JS source
     */
    uglify: {
      build: {
        src: 'src/js/dist/<%= pkg.name %>.js',
        dest: 'src/js/dist/<%= pkg.name %>.min.js'
      }
    },


    /**
     * Copy index.dev.html to index.html
     */
    copy: {
      build: {
        files: [
          { src: 'index.dev.html', dest: 'index.html' }
        ],
      },
    },


    /**
     * Update references to minified and concatenated resources
     */
    usemin: {
      build: ['index.html']
    },


    /**
     * bust dat cache and bust it good
     */
    cacheBust: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 16,
        ignorePatterns: ['lib/*']
      },
      build: {
        files: [
          { src: ['index.html'] }
        ]
      }
    }
  });


  /**
   * Tasks
   */
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-cache-bust');


  /**
   * Build Target
   */
  var buildTasks = ['clean', 'concat', 'uglify', 'copy', 'usemin', 'cacheBust'];
  grunt.registerTask('build', buildTasks);
};
