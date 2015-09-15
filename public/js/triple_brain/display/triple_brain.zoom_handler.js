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
    api.init = refreshZoom;
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

    EventBus.subscribe(
        '/event/ui/html/vertex/created/',
        function (event, vertex) {
            vertex.getLabel().on("keydown", refreshZoom);
        }
    );

    return api;
    function refreshZoom() {
        return;
        api._setLevel(
            getAppropriateZoomLevel()
        );
    }

    function getAppropriateZoomLevel() {
        var numberOfVertices = VertexUi.getNumber();
        switch (numberOfVertices) {
            case 1 :
                return getZoomLevelWhenOneVertex();
            default :
                return Math.min(8, numberOfVertices + 1);
        }
    }

    function getZoomLevelWhenOneVertex() {
        var zoomLevel = 0;
        VertexUi.visitAll(function (vertex) {
            var textLength = vertex.getLabel().text().length;
            if(textLength >= 19){
                zoomLevel = 5;
                return;
            }
            if(textLength >= 16){
                zoomLevel = 4;
                return;
            }
            if(textLength >= 13){
                zoomLevel = 3;
                return;
            }
            if(textLength >= 10){
                zoomLevel = 2;
                return;
            }
            if(textLength >= 7){
                zoomLevel = 1;
                return;
            }
        });
        console.log(zoomLevel);
        return zoomLevel;
    }
});