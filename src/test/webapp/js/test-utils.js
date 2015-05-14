/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery"
], function ($) {
    "use strict";
    var api = {};
    api.generateVertexUri = function(){
        return "\/service\/users\/foo\/graph\/vertex\/" + generateUuid();
    };
    api.generateEdgeUri = function(){
        return "\/service\/users\/foo\/graph\/edge\/" + generateUuid();
    };
    api.isGraphElementUiRemoved = function(element){
        return element.getHtml().parents(".root-vertex-super-container").length === 0;
    };
    api.pressKey = function(char){
        var event = $.Event("keydown");
        event.which = event.keyCode = char.charCodeAt(0);
        $("body").trigger(event);
    };
    return api;

    function generateUuid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
    }
});