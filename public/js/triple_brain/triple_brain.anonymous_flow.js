/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.language_manager",
    "triple_brain.mind_map_info",
    "triple_brain.event_bus"
], function ($, LanguageManager, MindMapInfo) {
    "use strict";
    var api = {};
    api.enter = function(){
        LanguageManager.loadLocaleContent(function(){
            $("html").i18n();
            getWelcomeContent().removeClass("hidden");
            $("body").removeClass("hidden");

        });
        MindMapInfo.setIsAnonymous(true);
        MindMapInfo.defineIsViewOnlyIfUndefined();
        $(".frontier").remove();
    };
    return api;
    function getWelcomeContent(){
        return $("#welcome-content");
    }
});