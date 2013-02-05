/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.event_bus"
],
    function(EventBus){
        var _implementation;
        var api = {};
        api.setImplementation = function(implementation){
            _implementation = implementation;
        };
        api.calculateUsingCentralVertex = function(centralVertex, depth){
            EventBus.publish(
                '/event/ui/graph/drawing_info/about_to/update',
                []
            );
            _implementation.calculateUsingCentralVertex(centralVertex, depth, function(drawingInfo){
                EventBus.publish(
                    '/event/ui/graph/drawing_info/updated/',
                    [drawingInfo, centralVertex.getId()]
                );
            })
        };
        return api;
    }
);