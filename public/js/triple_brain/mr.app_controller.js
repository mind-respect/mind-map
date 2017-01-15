/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "require",
    "mr.command"
], function (require, Command) {
    "use strict";
    var api = {};
    api.undoCanDo = function(){
        return Command.canUndo();
    };
    api.undo = function(){
        Command.undo();
    };
    api.redo = function(){
        Command.redo();
    };
    api.redoCanDo = function(){
        return Command.canRedo();
    };
    api.getUi = function () {
        return [];
    };
    return api;
});