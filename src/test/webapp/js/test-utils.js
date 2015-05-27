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
    api.pressCtrlPlusKey = function(char){
        api.pressKey(
            char, {ctrlKey: true}
        );
    };
    api.pressKey = function(char, options){
        api.pressKeyCode(
            char.charCodeAt(0),
            options
        );
    };
    api.pressKeyCode = function(keyCode, options){
        var event = $.Event("keydown");
        if(options !== undefined){
            $.extend(event, options);
        }
        event.which = event.keyCode = keyCode;
        $("body").trigger(event);
    };
    api.getChildWithLabel = function(bubble, label){
        var childWithLabel = bubble;
        bubble.visitAllChild(function(child){
            if(child.text() === label){
                childWithLabel = child;
                return false;
            }
        });
        return childWithLabel;
    };
    api.hasChildWithLabel = function(bubble, label){
        var hasChild = false;
        bubble.visitAllChild(function(child){
            if(child.text() === label){
                hasChild= true;
                return false;
            }
        });
        return hasChild;
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