/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "require",
    "jquery",
    "triple_brain.graph_element_main_menu"
], function (require, $, GraphElementMainMenu) {
    "use strict";
    /*
     inspired by http://blog.overnetcity.com/2014/11/18/undo-redo-angularjs-command-pattern/
     */
    var api = {};
    var undos = [],
        redos = [];

    api.undo = function () {
        if (!api.canUndo()) {
            return $.Deferred().resolve('nothing to do');
        }
        var command = undos.pop();
        return command.undo().then(function (data) {
            redos.push(command);
            api._reviewButtonsVisibility();
            return data;
        });
    };
    api.canUndo = function () {
        return undos.length > 0;
    };
    api.redo = function () {
        if (!api.canRedo()) {
            return $.Deferred().resolve();
        }
        var command = redos.pop();
        return command.execute().then(function (data) {
            undos.push(command);
            api._reviewButtonsVisibility();
            return data;
        });
    };

    api.canRedo = function () {
        return redos.length > 0;
    };

    api.executeCommand = function (command) {
        return command.execute().then(function (data) {
            undos.push(command);
            api._reviewButtonsVisibility();
            return data;
        });
    };

    api.forExecuteUndoAndRedo = function (executeFtcn, undoFctn, redoFctn) {
        return new api.Command(
            executeFtcn, undoFctn, redoFctn
        );
    };

    api.Command = function (executeFtcn, undoFctn, redoFctn) {
        this.executeFtcn = executeFtcn;
        this.undoFtcn = undoFctn;
        this.redoFctn = redoFctn;
    };

    api.Command.prototype.execute = function () {
        return this.executeFtcn();
    };

    api.Command.prototype.undo = function () {
        return this.undoFtcn();
    };

    api.Command.prototype.redo = function () {
        return this.redoFctn();
    };

    api._reviewButtonsVisibility = function(){
        require(
            'triple_brain.graph_element_main_menu'
        ).reviewButtonsVisibility();
    };
    return api;

});