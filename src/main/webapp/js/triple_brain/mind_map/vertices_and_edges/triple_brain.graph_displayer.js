/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "triple_brain.event_bus",
    "triple_brain.mind_map_info",
    "triple_brain.id_uri",
    "triple_brain.ui.graph"
    ],
    function(require, EventBus, MindMapInfo, IdUriUtils, GraphUi){
        var _implementation;
        var api = {};
        api.setImplementation = function(implementation){
            _implementation = implementation;
        };
        api.displayUsingDefaultVertex = function(){
            displayUsingCentralVertexId(
                MindMapInfo.defaultVertexId()
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
        api.addVertex = function(newVertex, parentVertex){
            return _implementation.addVertex(newVertex, parentVertex);
        };
        api.allowsMovingVertices = function(){
            return _implementation.allowsMovingVertices();
        };
        api.positionOfNewVertex = function(sourceVertex){
            return _implementation.positionOfNewVertex(sourceVertex);
        };
        api.integrateEdges = function(edges){
            return _implementation.integrateEdges(edges);
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
            GraphUi.reset();
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