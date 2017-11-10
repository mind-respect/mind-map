/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile: {
                options: {
                    baseUrl: "public/js",
                    mainConfigFile: "public/js/common-boot.js",
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
                    specs: 'spec/**/*_spec.js',
                    keepRunner: true,
                    version: "2.0.1",
                    template: require('grunt-template-jasmine-requirejs'),
                    outfile: "public/_SpecRunner.html",
                    templateOptions: {
                        requireConfigFile: 'public/js/common-boot.js',
                        requireConfig: {
                            baseUrl: './js/'
                        }
                    },
                    template: require('grunt-template-jasmine-requirejs')
                }
            }
        },
        jshint: {
            all: {
                src: [
                    'public/js/triple_brain/**',
                    'public/js/module/**/*.js',
                    'spec/*.js',
                    'spec/triple_brain/**',
                    'spec/mock/**',
                    'spec/module/**'
                ]
            },
            options: {
                curly: true,
                eqeqeq: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                strict: true,
                jasmine: true,
                predef: ["define", "crow", "crypto", "bubl_guru_force_refresh", "spyOnEvent", "usernameForBublGuru", "graphElementShortIdForBublGuru", "bublGuruFlow", "diff_match_patch"],
                browser: true,
                funcscope: true,
                validthis: true,
                devel: true
            }
        },
        connect: {
            server: {
                options: {
                    base: "./",
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
    grunt.loadNpmTasks('grunt-contrib-jshint');

    //Create an alias task named 'test' for ease of use
    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('browser-test', ['connect']);
    grunt.registerTask('watch', ['watch']);
};