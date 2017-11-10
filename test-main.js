/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

var tests = [];

for (var file in window.__karma__.files) {
    if (/\_spec\.js$/.test(file)) {
        tests.push(file);
    }
}

var requireJsConfig = window.__karma__.config.requireJsConfig;

requireJsConfig.baseUrl  = '/base/public/js';
requireJsConfig.deps = tests;
requireJsConfig.callback = window.__karma__.start;
requirejs.config(requireJsConfig);