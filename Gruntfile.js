// Generated on 2016-07-23 using generator-angular 0.15.1
'use strict';



module.exports = function (grunt) {

    require('time-grunt')(grunt);

    // Automatically load required Grunt tasks
    require('jit-grunt')(grunt, {
        sftp: 'grunt-ssh',
        sshexec: 'grunt-ssh'
    });

    grunt.initConfig({
        secret: grunt.file.readJSON('secret.json'),
        sftp: {
            test: {
                files: {
                    "./": [
                        "server/bin/**",
                        "server/config/**",
                        "server/database/**",
                        "server/dist/**",
                        "server/logger/**",
                        "server/modules/**",
                        "server/router/**",
                        "server/socket/**",
                        "server/app.js",
                        "server/package.json"
                    ]
                },
                options: {
                    path: '/home/newschannel/desklogs',
                    host: '<%= secret.host %>',
                    username: '<%= secret.username %>',
                    privateKey: grunt.file.read("NewsChannel.pem"),
                    showProgress: true,
                    srcBasePath: 'server/',
                    createDirectories: true
                }
            }
        },
        sshexec: {
            test: {
                command: ['npm update','pm2 restart www'],
                options: {
                    host: '<%= secret.host %>',
                    username: '<%= secret.username %>',
                    privateKey: grunt.file.read("NewsChannel.pem")
                }
            }
        }
    });

    grunt.registerTask('default', [
        'newer:jshint',
        'newer:jscs',
        'test',
        'build'
    ]);

    grunt.registerTask('deploy', [
        'sftp',
        'sshexec'
    ]);

    grunt.registerTask('restart-remote',[
        'sshexec'
    ]);


};