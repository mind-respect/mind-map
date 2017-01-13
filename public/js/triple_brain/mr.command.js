/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery"
], function ($) {
    "use strict";
    /*
    inspired by http://blog.overnetcity.com/2014/11/18/undo-redo-angularjs-command-pattern/
     */
    var api = {};
    var undos = [],
        redos = [];

    api.undo = function(){
        if (!undos.length) {
            return $.Deferred().resolve('nothing to do');
        }
        var command = undos.pop();
        return command.undo().then(function(data) {
            redos.push(command);
            return data;
        });
    };
    api.redo = function(){
        if (!redos.length) {
            return $.Deferred().resolve();
        }
        var command = redos.pop();
        return command.execute().then(function(data) {
            undos.push(command);
            return data;
        });
    };

    api.executeCommand = function(command){
        return command.execute().then(function(data) {
            undos.push(command);
            return data;
        });
    };

    api.forExecuteUndoAndRedo = function(executeFtcn, undoFctn, redoFctn){
        return new api.Command(
            executeFtcn, undoFctn, redoFctn
        );
    };

    api.Command = function (executeFtcn, undoFctn, redoFctn){
        this.executeFtcn = executeFtcn;
        this.undoFtcn = undoFctn;
        this.redFctn = redoFctn;
    };

    api.Command.prototype.execute = function(){
        return this.executeFtcn();
    };

    api.Command.prototype.undo = function(){
        return this.undoFtcn();
    };

    api.Command.prototype.redo = function(){
        return this.redFctn();
    };

    return api;
});