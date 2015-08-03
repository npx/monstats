module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /**
     * Clean the cache busted files
     */
    clean: {
      js: ["dist/js/*.*.*.js"],
      css: ["dist/css/*.*.css"]
    },

    /**
     * Concatenate all source files
     */
    concat: {
      options: { separator: '\n' },
      build: {
        src: ['src/app/**/*.js'],
        dest: 'dist/js/<%= pkg.name %>.js'
      },
    },


    /**
     * Minify the JS source
     */
    uglify: {
      build: {
        src: 'dist/js/<%= pkg.name %>.js',
        dest: 'dist/js/<%= pkg.name %>.min.js'
      }
    },


    /**
     * Copy files that stay untouched or are modified inplace
     */
    copy: {
      build: {
        files: [
          { src: 'src/index.html', dest: 'dist/index.html' },
          { expand: true, cwd: 'src', src: ['css/*', 'data/*', 'lib/*'], dest: 'dist/' }
        ]
      }
    },


    /**
     * Update references to minified and concatenated resources
     */
    usemin: {
      build: ['dist/index.html']
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
          { src: ['dist/index.html'] }
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
