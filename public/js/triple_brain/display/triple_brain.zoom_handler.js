/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.ui.graph",
    "triple_brain.event_bus",
    "triple_brain.vertex_ui"
], function ($, GraphUi, EventBus, VertexUi) {
    "use strict";
    var api = {};
    api.getLevel = function () {
        return GraphUi.getDrawnGraph().data("zoom");
    };
    api._setLevel = function (level) {
        GraphUi.getDrawnGraph().data(
            "zoom", level
        ).attr(
            "data-zoom", level
        );
    };
    EventBus.subscribe(
        '/event/ui/graph/vertex_and_relation/added/',
        refreshZoom
    );
    EventBus.subscribe(
        '/event/ui/graph/vertex/deleted/',
        refreshZoom
    );
    return api;
    function refreshZoom(){
        var numberOfVertices = VertexUi.getNumber();
        var zoomLevel = numberOfVertices === 1 ? 1 : 2;
        api._setLevel(zoomLevel);
    }
});