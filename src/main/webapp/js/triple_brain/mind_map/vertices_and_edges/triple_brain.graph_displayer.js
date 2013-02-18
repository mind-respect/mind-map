/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "triple_brain.event_bus",
    "triple_brain.ui.vertex",
    "triple_brain.id_uri"
    ],
    function(require, EventBus, Vertex, IdUriUtils){
        var _implementation;
        var api = {};
        api.setImplementation = function(implementation){
            _implementation = implementation;
        };
        api.displayUsingDefaultVertex = function(){
            displayUsingCentralVertexId(
                Vertex.defaultVertexId()
            );
        };
        api.displayUsingNewCentralVertex = function(centralVertex){
            displayUsingCentralVertexId(
                centralVertex.getId()
            );
        };
        api.displayUsingNewCentralVertexUri = function(newCentralVertexUri){
            displayUsingCentralVertexId(
                IdUriUtils.graphElementIdFromUri(
                    newCentralVertexUri
                )
            );
        };
        return api;
        function currentDepth(){
            return getDepthSlider().currentDepth();
        }
        function getDepthSlider(){
            return require("triple_brain.ui.depth_slider");
        }
        function publishAboutToUpdate(){
            EventBus.publish(
                '/event/ui/graph/drawing_info/about_to/update',
                []
            );
        }
        function publishDrawingInfoUpdated(drawingInfo, centralVertexId){
            EventBus.publish(
                '/event/ui/graph/drawing_info/updated/',
                [drawingInfo, centralVertexId]
            );
        }
        function displayUsingCentralVertexId(centralVertexId){
            publishAboutToUpdate();
            var centralVertexUri = IdUriUtils.uriFromGraphElementId(
                centralVertexId
            );
            _implementation.displayUsingDepthAndCentralVertexUri(
                centralVertexUri,
                currentDepth(),
                function(drawingInfo){
                    publishDrawingInfoUpdated(
                        drawingInfo,
                        centralVertexId
                    )
                }
            );
        }
    }
);