/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.mind_map_info",
    "triple_brain.event_bus"
], function ($, MindMapInfo, EventBus) {
    "use strict";
    var api = {};
    EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function () {
        if (MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
            return;
        }
        getLegendContainer().addClass("hidden");
    });
    return api;
    function getLegendContainer() {
        return getPanel().find(".legend-container");
    }

    function getPanel() {
        return $("#bottom-center-panel");
    }
});