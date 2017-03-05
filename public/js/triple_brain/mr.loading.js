/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define(["jquery"], function ($) {
    "use strict";
    var api = {};
    api.show = function(){
        getOverlay().removeClass("hidden");
        getLoadMessage().removeClass("hidden");
    };
    api.hide = function(){
        getOverlay().addClass("hidden");
        getLoadMessage().addClass("hidden");
    };
    return api;
    function getOverlay(){
        return $("#overlay");
    }
    function getLoadMessage(){
        return $(".loading");
    }
});