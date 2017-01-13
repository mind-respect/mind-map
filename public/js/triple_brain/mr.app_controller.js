/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "mr.command"
], function (Command) {
    "use strict";
    var api = {};
    api.undo = function(){
        Command.undo();
    };
    api.redo = function(){
        Command.redo();
    };
    return api;
});