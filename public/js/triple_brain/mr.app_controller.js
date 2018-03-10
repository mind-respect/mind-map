/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "mr.command",
    "triple_brain.graph_ui"
], function ($, Command, GraphUi) {
    "use strict";
    var api = {};
    api.undoCanDo = function () {
        return Command.canUndo();
    };
    api.undo = function () {
        Command.undo();
    };
    api.redo = function () {
        Command.redo();
    };
    api.redoCanDo = function () {
        return Command.canRedo();
    };
    api.getUi = function () {
        return [];
    };
    api.find = function () {
        $("#vertex-search-input").focus();
    };
    api.zoomIn = function () {
        GraphUi.zoom(
            0.1
        );
    };
    api.zoomOut = function () {
        GraphUi.zoom(
            -0.1
        );
    };

    api.isMultiple = function(){
        return false;
    };

    return api;
});
