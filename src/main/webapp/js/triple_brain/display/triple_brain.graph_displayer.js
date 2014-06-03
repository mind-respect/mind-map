/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.event_bus",
    "triple_brain.mind_map_info",
    "triple_brain.id_uri",
    "triple_brain.menu"
    ],
    function(EventBus, MindMapInfo, IdUriUtils, Menu){
        "use strict";
        var _implementation,
            api = {};
        api.setImplementation = function(implementation){
            _implementation = implementation;
            var isGraph = _implementation.name() === "graph";
            Menu.showAsGraphButton()[isGraph ? "addClass" : "removeClass"]("hidden");
            Menu.showAsTreeButton()[isGraph ? "removeClass" : "addClass"]("hidden");
            Menu.redrawButton()[
                _implementation.allowsMovingVertices() ?
                    "removeClass" :
                    "addClass"
                ]("hidden");
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
        };
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
        api.getEdgeDrawer = function(){
            return _implementation.getEdgeDrawer();
        };
        api.couldDestinationBubbleAppearAsSourceBubble = function(){
            return !api.allowsMovingVertices();
        };
        api.getEdgeSelector = function(){
            return _implementation.getEdgeSelector();
        };
        api.getVertexSelector = function(){
            return _implementation.getVertexSelector();
        };
        api.canAddChildTree = function(){
            return _implementation.canAddChildTree();
        };
        api.addChildTree = function(parentVertex, callback){
            return _implementation.addChildTree(
                parentVertex,
                callback
            );
        };
        api.buildIncludedGraphElementsView = function(vertex, container){
            return _implementation.buildIncludedGraphElementsView(
                vertex,
                container
            );
        };
        api.getVertexMenuHandler = function(){
            return _implementation.getVertexMenuHandler();
        };
        api.getRelationMenuHandler = function(){
            return _implementation.getRelationMenuHandler();
        };
        api.getGraphElementMenuHandler = function(){
            return _implementation.getGraphElementMenuHandler();
        };
        api.getGraphMenuHandler = function(){
            return _implementation.getGraphMenuHandler();
        };
        api.integrateEdgesOfServerGraphForViewOnly = function(drawnGraph){
            return _implementation.integrateEdgesOfServerGraphForViewOnly(
                drawnGraph
            );
        };
        api.canGetIsToTheLeft = function(){
            return !api.allowsMovingVertices();
        };
        return api;

        function currentDepth(){
            return 1;
        }

        function publishAboutToUpdate(){
            EventBus.publish(
                '/event/ui/graph/drawing_info/about_to/update',
                []
            );
        }
        function publishResetGraph(){
            EventBus.publish(
                '/event/ui/graph/reset',
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
            publishAboutToUpdate();
            publishResetGraph();
            $("#drawn_graph").empty();
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