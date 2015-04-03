/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.mind_map_info",
    "triple_brain.event_bus"
], function (MindMapInfo, EventBus) {
    "use strict";
    var api = {};
    EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function(){
        if(MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
            getAboutLink().addClass("hidden");
        }else{
            getLegendContainer().addClass("hidden");
        }
    });
    return api;
    function getLegendContainer(){
        return getPanel().find(".legend-container");
    }
    function getAboutLink(){
        return getPanel().find("a");
    }
    function getPanel(){
        return $("#bottom-center-panel");
    }
});