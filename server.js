/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8084);