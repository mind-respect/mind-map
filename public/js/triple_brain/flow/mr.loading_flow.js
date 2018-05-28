/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.keyboard_actions_handler",
    "triple_brain.graph_ui"
], function ($, KeyBoardActionHandler, GraphUi) {
    "use strict";
    var api = {};
    api.enter = function(){
        getOverlay().removeClass("hidden");
        getLoadMessage().removeClass("hidden");
        KeyBoardActionHandler.disable();
        GraphUi.disableDragScroll();
    };
    api.leave = function(){
        getOverlay().addClass("hidden");
        getLoadMessage().addClass("hidden");
        KeyBoardActionHandler.enable();
        GraphUi.enableDragScroll();
    };
    return api;
    function getOverlay(){
        return $("#overlay");
    }
    function getLoadMessage(){
        return $(".loading");
    }
});