'use strict';
module.exports = function(grunt) {
    grunt.initConfig({
        connect: {
            options: {
                livereload: 35729
            },
            local: {
                options: {
                    port: 9002,
                    hostname: 'localhost',
                    open: true,
                    keepalive: true,
                    base: [
                        ''
                    ]
                }
            },
            dist: {
                options: {
                    port: 9002,
                    hostname: 'localhost',
                    base: 'app/dist',
                    keepalive: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('serve', function() {
            return grunt.task.run([
                'connect:local'
            ]);
    });
};