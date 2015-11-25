/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.language_manager",
    "triple_brain.mind_map_info",
    "triple_brain.event_bus",
    "bootstrap-modal-carousel"
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
        setUpFeatures();
        $(".frontier").remove();
    };
    return api;
    function getWelcomeContent(){
        return $("#welcome-content");
    }

    function setUpFeatures(){
        $(document).on("slide.bs.carousel", function(event){
            var $item = $(event.relatedTarget);
            var controls = $item.closest(".action").find("[data-slide-to]");
            controls.removeClass("active");
            controls.filter(
                "[data-slide-to="+$item.index()+"]"
            ).addClass(
                "active"
            );
        });
    }
});