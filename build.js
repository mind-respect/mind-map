/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

var requirejs = require('requirejs');
var requirejsConfig = require('./requirejsConfig');
requirejsConfig.baseUrl = "public/js";
requirejsConfig.name = "mind_map-boot";
requirejsConfig.logLevel = 4;
requirejsConfig.out = "public/js/mind-map-built.js";
requirejsConfig.generateSourceMaps =  true;
requirejsConfig.preserveLicenseComments = false;
requirejsConfig.optimize = 'uglify2';
var amdOptimizationConfig = requirejsConfig;
requirejs.optimize(amdOptimizationConfig, function (buildResponse) {
    //buildResponse is just a text output of the modules
    //included. Load the built file for the contents.
    //Use config.out to get the optimized file contents.
    var contents = fs.readFileSync(config.out, 'utf8');
}, function(err) {
    //optimization err callback
    console.log(err);
});
