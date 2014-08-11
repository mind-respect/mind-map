/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "triple_brain.event_bus",
        "triple_brain.mind_map_info"
    ],
    function (EventBus, MindMapInfo) {
        "use strict";
        var _implementation,
            api = {};
        api.setImplementation = function (implementation) {
            _implementation = implementation;
        };
        api.name = function () {
            return _implementation.name();
        };
        api.displayUsingDefaultVertex = function () {
            displayUsingCentralVertexUri(
                MindMapInfo.defaultVertexUri()
            );
        };
        api.displayUsingCentralVertex = function (centralVertex) {
            displayUsingCentralVertexUri(
                centralVertex.getUri()
            );
        };
        api.displayUsingCentralVertexUri = function (centralVertexUri) {
            displayUsingCentralVertexUri(
                centralVertexUri
            );
        };
        api.connectVertexToVertexWithUri = function (parentVertex, destinationVertexUri, callback) {
            _implementation.connectVertexToVertexWithUri(
                parentVertex,
                destinationVertexUri,
                callback
            );
        };

        api.addVertex = function (newVertex, parentVertex) {
            return _implementation.addVertex(newVertex, parentVertex);
        };
        api.addEdge = function (newEdge, sourceVertex, destinationVertex) {
            return _implementation.addEdge(
                newEdge,
                sourceVertex,
                destinationVertex
            );
        };
        api.addEdgeBetweenExistingVertices = function (newEdge) {
            return _implementation.addEdgeBetweenExistingVertices(newEdge);
        };
        api.allowsMovingVertices = function () {
            return _implementation.allowsMovingVertices();
        };
        api.positionOfNewVertex = function (sourceVertex) {
            return _implementation.positionOfNewVertex(sourceVertex);
        };
        api.couldHaveDuplicates = function () {
            return !api.allowsMovingVertices();
        };
        api.couldDestinationBubbleAppearAsSourceBubble = function () {
            return !api.allowsMovingVertices();
        };
        api.getEdgeSelector = function () {
            return _implementation.getEdgeSelector();
        };
        api.getVertexSelector = function () {
            return _implementation.getVertexSelector();
        };
        api.getGroupRelationSelector = function () {
            return _implementation.getGroupRelationSelector();
        };
        api.canAddChildTree = function () {
            return _implementation.canAddChildTree();
        };
        api.addChildTree = function (parentVertex, callback) {
            return _implementation.addChildTree(
                parentVertex,
                callback
            );
        };
        api.buildIncludedGraphElementsView = function (vertex, container) {
            return _implementation.buildIncludedGraphElementsView(
                vertex,
                container
            );
        };
        api.getVertexMenuHandler = function () {
            return _implementation.getVertexMenuHandler();
        };
        api.getRelationMenuHandler = function () {
            return _implementation.getRelationMenuHandler();
        };
        api.getGraphElementMenuHandler = function () {
            return _implementation.getGraphElementMenuHandler();
        };
        api.getGraphMenuHandler = function () {
            return _implementation.getGraphMenuHandler();
        };
        api.canGetIsToTheLeft = function () {
            return !api.allowsMovingVertices();
        };
        api.expandGroupRelation = function (groupRelation) {
            return _implementation.expandGroupRelation(groupRelation);
        };
        return api;
        function currentDepth() {
            return 1;
        }

        function publishAboutToUpdate() {
            EventBus.publish(
                '/event/ui/graph/drawing_info/about_to/update',
                []
            );
        }

        function publishResetGraph() {
            EventBus.publish(
                '/event/ui/graph/reset',
                []
            );
        }

        function publishDrawingInfoUpdated(drawingInfo, centralVertexUri) {
            EventBus.publish(
                '/event/ui/graph/drawing_info/updated/',
                [drawingInfo, centralVertexUri]
            );
        }

        function displayUsingCentralVertexUri(centralVertexUri) {
            publishAboutToUpdate();
            publishResetGraph();
            $("#drawn_graph").empty();
            _implementation.displayUsingDepthAndCentralVertexUri(
                centralVertexUri,
                currentDepth(),
                function (drawingInfo) {
                    var shouldPushState = !MindMapInfo.isCenterVertexUriDefinedInUrl() ||
                        MindMapInfo.getCenterVertexUriFromUrl() !== centralVertexUri;
                    if (shouldPushState) {
                        history.pushState(
                            {},
                            '',
                                "?bubble=" + centralVertexUri
                        );
                    }
                    publishDrawingInfoUpdated(
                        drawingInfo,
                        centralVertexUri
                    );
                }
            );
        }
    }
);