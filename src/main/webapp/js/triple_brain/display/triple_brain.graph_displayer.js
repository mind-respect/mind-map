/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "triple_brain.event_bus",
    "triple_brain.mind_map_info",
    "triple_brain.id_uri",
    "triple_brain.ui.graph",
    "triple_brain.menu"
    ],
    function(require, EventBus, MindMapInfo, IdUriUtils, GraphUi, Menu){
        var _implementation;
        var api = {};
        api.setImplementation = function(implementation){
            _implementation = implementation;
            var isGraph = _implementation.name() === "graph";
            Menu.showAsGraphButton()[isGraph ? "hide" : "show"]();
            Menu.showAsTreeButton()[isGraph ? "show" : "hide"]();
            Menu.redrawButton()[
                _implementation.allowsMovingVertices() ?
                    "show" :
                    "hide"
                ]();
        };
        api.name = function(){
            return _implementation.name();
        };
        api.displayUsingDefaultVertex = function(){
            displayUsingCentralVertexUri(
                MindMapInfo.defaultVertexUri()
            );
        };
        api.displayUsingNewCentralVertex = function(centralVertex){
            displayUsingCentralVertexUri(
                centralVertex.getUri()
            );
        };
        api.displayUsingNewCentralVertexUri = function(newCentralVertexUri){
            displayUsingCentralVertexUri(
                newCentralVertexUri
            );
        };
        api.connectVertexToVertexWithUri = function(parentVertex, destinationVertexUri, callback){
            _implementation.connectVertexToVertexWithUri(
                parentVertex,
                destinationVertexUri,
                callback
            );
        };

        api.addVertex = function(newVertex, parentVertex){
            return _implementation.addVertex(newVertex, parentVertex);
        };
        api.addEdge = function(newEdge, sourceVertex, destinationVertex){
            return _implementation.addEdge(
                newEdge,
                sourceVertex,
                destinationVertex
            );
        };
        api.addEdgeBetweenExistingVertices = function(newEdge){
            return _implementation.addEdgeBetweenExistingVertices(newEdge);
        }
        api.allowsMovingVertices = function(){
            return _implementation.allowsMovingVertices();
        };
        api.positionOfNewVertex = function(sourceVertex){
            return _implementation.positionOfNewVertex(sourceVertex);
        };
        api.integrateEdgesOfServerGraph = function(drawnGraph){
            return _implementation.integrateEdgesOfServerGraph(
                drawnGraph
            );
        };
        api.couldHaveDuplicates = function(){
            return !api.allowsMovingVertices();
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
        function publishDrawingInfoUpdated(drawingInfo, centralVertexUri){
            EventBus.publish(
                '/event/ui/graph/drawing_info/updated/',
                [drawingInfo, centralVertexUri]
            );
        }
        function displayUsingCentralVertexUri(centralVertexUri){
            GraphUi.reset();
            publishAboutToUpdate();
            _implementation.displayUsingDepthAndCentralVertexUri(
                centralVertexUri,
                currentDepth(),
                function(drawingInfo){
                    publishDrawingInfoUpdated(
                        drawingInfo,
                        centralVertexUri
                    )
                }
            );
        }
    }
);