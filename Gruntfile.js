/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

//module.exports = function(grunt) {
//
//    // Project configuration.
//    grunt.initConfig({
//        pkg: grunt.file.readJSON('package.json'),
//        uglify: {
//            options: {
//                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
//            },
//            build: {
//                src: 'src/<%= pkg.name %>.js',
//                dest: 'build/<%= pkg.name %>.min.js'
//            }
//        }
//    });
//
//    // Load the plugin that provides the "uglify" task.
//    grunt.loadNpmTasks('grunt-contrib-uglify');
//
//    // Default task(s).
//    grunt.registerTask('default', ['uglify']);
//
//};

//module.exports = function(grunt) {
//    grunt.initConfig({
//        jasmine : {
//            amd: true,
//            // Your Jasmine spec files
//            specs : 'src/test/webapp/**/*spec.js',
//            // Your spec helper files
//            helpers: [
//                '/src/main/webapp/js/require.js',
//                '/src/main/webapp/js/common-boot.js'
//            ]
//        }
//    });
//
//    // Register tasks.
//    grunt.loadNpmTasks('grunt-jasmine-runner');
//
//    // Default task.
//    grunt.registerTask('default', 'jasmine');
//};
//module.exports = function(grunt) {
//    grunt.registerTask('default', 'Log some stuff.', function() {
//        grunt.log.write('Logging some stuff...').ok();
//    });
//};


//module.exports = function(grunt) {
//
//    // Project configuration.
//    grunt.initConfig({
//        lint: {
//            files: ['src/main/webapp/js/**/*.js','src/test/webapp/js/**/*.js']
//        },
//        //watch: {
//        //    files: ['<config:jasmine.specs>','src/**/*js'],
//        //    tasks: 'jasmine'
//        //},
//        //jasmine : {
//        //    src : 'src/main/webapp/js/**/*.js',
//        //    specs : 'src/test/webapp/js/**/*.js'
//        //},
//        jshint: {
//            options: {
//                curly: true,
//                eqeqeq: true,
//                immed: true,
//                latedef: true,
//                newcap: true,
//                noarg: true,
//                sub: true,
//                undef: true,
//                boss: true,
//                eqnull: true,
//                node: true,
//                es5: true
//            },
//            globals: {
//                jasmine : false,
//                describe : false,
//                beforeEach : false,
//                expect : false,
//                it : false,
//                spyOn : false
//            }
//        }
//    });
//
//    grunt.loadNpmTasks('grunt-jasmine-runner');
//
//
//    // Default task.
//    grunt.registerTask('default', 'lint');
//
//};

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile: {
                options: {
                    baseUrl:"public/js",
                    mainConfigFile:"public/js/common-boot.js",
                    name: "mind_map-boot",
                    out: "public/js/mind-map-built.js",
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    optimize: 'uglify2'
                }
            }
        },
        jasmine: {
            testAll: {
                options: {
                    src: 'public/js/**/*.js',
                    specs: 'spec/**/*.js',
                    keepRunner: true,
                    version: "2.0.1",
                    template: require('grunt-template-jasmine-requirejs'),
                    outfile:"public/_SpecRunner.html",
                    templateOptions: {
                        requireConfigFile: 'public/js/common-boot.js'
                    }
                }
            }
            //pivotal: {
            //    src: 'js/**/*.js',
            //    options: {
            //        specs: 'spec/**/*.js',
            //        template: require('grunt-template-jasmine-requirejs'),
            //        templateOptions: {
            //            requireConfigFile: 'js/common-boot.js'
            //        }
            //    }
            //}
        },
        //watch: {
        //    files: [
        //        'js/triple_brain/**/*.js',
        //        'js/module/**/*.js',
        //        'spec/**/*.js'
        //    ],
        //    tasks: ['jasmine']
        //},
        //watch: {
        //    pivotal : {
        //        files: ['src/**/*.js', 'spec/**/*.js'],
        //        tasks: 'jasmine:pivotal:build'
        //    }
        //},
        connect: {
            server: {
                options: {
                    base:"./",
                    port: 9001,
                    keepalive: true
                }
            }
        }
    });

    //Load jasmine task
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    //Create an alias task named 'test' for ease of use
    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('browser-test', ['connect']);
    grunt.registerTask('watch', ['watch']);
};