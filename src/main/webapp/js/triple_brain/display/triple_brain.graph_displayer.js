/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "triple_brain.event_bus",
        "triple_brain.mind_map_info",
        "triple_brain.id_uri"
    ],
    function (EventBus, MindMapInfo, IdUriUtils) {
        "use strict";
        var _implementation,
            api = {};
        api.setImplementation = function (implementation) {
            _implementation = implementation;
        };
        api.name = function () {
            return _implementation.name();
        };
        api.displayUsingCentralVertex = function (centralVertex) {
            api.displayUsingCentralVertexUri(
                centralVertex.getUri()
            );
        };
        api.displayUsingCentralVertexUri = function (centralVertexUri, errorCallback) {
            displayUsingBubbleUri(
                centralVertexUri,
                _implementation.displayForVertexWithUri,
                errorCallback
            );
        };
        api.displayForSchemaWithUri = function(schemaUri, errorCallback){
            displayUsingBubbleUri(
                schemaUri,
                _implementation.displayForSchemaWithUri,
                errorCallback
            );
        };
        api.displayForBubbleWithUri = function(bubbleUri, errorCallback){
            return IdUriUtils.isSchemaUri(bubbleUri) ?
                api.displayForSchemaWithUri(bubbleUri, errorCallback) :
                api.displayUsingCentralVertexUri(bubbleUri, errorCallback);
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

        api.showSuggestions = function (vertex) {
            return _implementation.showSuggestions(vertex);
        };

        api.addProperty = function(property, schema){
            return _implementation.addProperty(
                property,
                schema
            );
        };
        api.addEdge = function (newEdge, sourceVertex, destinationVertex) {
            return _implementation.addEdge(
                newEdge,
                sourceVertex,
                destinationVertex
            );
        };
        api.addEdgeAndVertex = function (sourceBubbleUi, edge, destinationVertex) {
            return _implementation.addEdgeAndVertex(
                sourceBubbleUi,
                edge,
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
        api.getSchemaSelector = function () {
            return _implementation.getSchemaSelector();
        };
        api.getPropertySelector = function () {
            return _implementation.getPropertySelector();
        };
        api.getGroupRelationSelector = function () {
            return _implementation.getGroupRelationSelector();
        };
        api.getVertexSuggestionSelector = function () {
            return _implementation.getVertexSuggestionSelector();
        };
        api.getRelationSuggestionSelector = function () {
            return _implementation.getRelationSuggestionSelector();
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
        api.getGroupRelationMenuHandler = function () {
            return _implementation.getGroupRelationMenuHandler();
        };
        api.getSchemaMenuHandler = function () {
            return _implementation.getSchemaMenuHandler();
        };
        api.getPropertyMenuHandler = function () {
            return _implementation.getPropertyMenuHandler();
        };
        api.getVertexSuggestionMenuHandler = function(){
            return _implementation.getVertexSuggestionMenuHandler();
        };
        api.getRelationSuggestionMenuHandler = function(){
            return _implementation.getRelationSuggestionMenuHandler();
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
        api.reset = function(){
            publishAboutToUpdate();
            publishResetGraph();
            $("#drawn_graph").empty();
        };
        return api;

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

        function publishDrawingInfoUpdated(centralVertexUri) {
            EventBus.publish(
                '/event/ui/graph/drawing_info/updated/',
                [centralVertexUri]
            );
        }

        function displayUsingBubbleUri(centralBubbleUri, displayer, errorCallback) {
            api.reset();
            var shouldPushState = !MindMapInfo.isCenterBubbleUriDefinedInUrl() ||
                MindMapInfo.getCenterBubbleUri() !== centralBubbleUri;
            if (shouldPushState) {
                history.pushState(
                    {},
                    '',
                        "?bubble=" + centralBubbleUri
                );
            }
            displayer(
                centralBubbleUri,
                function (centerVertexUri) {
                    publishDrawingInfoUpdated(
                        centerVertexUri
                    );
                },
                errorCallback
            );
        }
    }
);