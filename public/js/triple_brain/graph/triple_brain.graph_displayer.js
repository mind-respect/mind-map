/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.event_bus",
        "triple_brain.mind_map_info",
        "triple_brain.id_uri",
        "triple_brain.graph_ui",
        "triple_brain.graph_element_type"
    ],
    function ($, EventBus, MindMapInfo, IdUri, GraphUi, GraphElementType) {
        "use strict";
        var _implementation,
            api = {};
        api.setImplementation = function (implementation) {
            _implementation = implementation;
        };
        api.name = function () {
            return _implementation.name();
        };
        api.displayUsingCentralBubble = function (centralBubble) {
            api.displayUsingCentralBubbleUri(
                centralBubble.getUri()
            );
        };
        api.displayUsingCentralBubbleUri = function (centralVertexUri, errorCallback) {
            displayUsingBubbleUri(
                centralVertexUri,
                _implementation.displayForBubbleWithUri,
                errorCallback
            );
        };
        api.displayForSchemaWithUri = function (schemaUri, errorCallback) {
            displayUsingBubbleUri(
                schemaUri,
                _implementation.displayForSchemaWithUri,
                errorCallback
            );
        };

        api.displayForMetaWithUri = function (metaUri, errorCallback) {
            displayUsingBubbleUri(
                metaUri,
                _implementation.displayForMetaWithUri,
                errorCallback
            );
        };

        api.displayForBubbleWithUri = function (bubbleUri, errorCallback) {
            switch(IdUri.getGraphElementTypeFromUri(bubbleUri)){
                case GraphElementType.Schema :
                    return api.displayForSchemaWithUri(bubbleUri, errorCallback);
                case GraphElementType.Vertex :
                case GraphElementType.Relation :
                    return api.displayUsingCentralBubbleUri(bubbleUri, errorCallback);
                case GraphElementType.Meta :
                    return api.displayForMetaWithUri(bubbleUri, errorCallback);
            }
        };
        api.connectVertexToVertexWithUri = function (parentVertex, destinationVertexUri, callback) {
            return _implementation.connectVertexToVertexWithUri(
                parentVertex,
                destinationVertexUri,
                callback
            );
        };

        api.addProperty = function (property, schema) {
            return _implementation.addProperty(
                property,
                schema
            );
        };

        api.addEdgeAndVertex = function (sourceBubbleUi, edge, destinationVertex) {
            return _implementation.addEdgeAndVertex(
                sourceBubbleUi,
                edge,
                destinationVertex
            );
        };
        api.addSuggestionToSourceVertex = function (suggestion, parentVertexUi) {
            return _implementation.addSuggestionToSourceVertex(
                suggestion, parentVertexUi
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
        api.getMetaUiSelector = function () {
            return _implementation.getMetaUiSelector();
        };
        api.getGroupVertexUnderMetaUiSelector = function () {
            return _implementation.getGroupVertexUnderMetaUiSelector();
        };
        api.getMetaUiRelationSelector = function () {
            return _implementation.getMetaUiRelationSelector();
        };
        api.canAddChildTree = function () {
            return _implementation.canAddChildTree();
        };
        api.addChildTree = function (parentVertex) {
            return _implementation.addChildTree(
                parentVertex
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
        api.getVertexSuggestionController = function () {
            return _implementation.getVertexSuggestionController();
        };
        api.getRelationSuggestionMenuHandler = function () {
            return _implementation.getRelationSuggestionMenuHandler();
        };
        api.getGraphElementMenuHandler = function () {
            return _implementation.getGraphElementMenuHandler();
        };
        api.getGraphMenuHandler = function () {
            return _implementation.getGraphMenuHandler();
        };
        api.getAppController = function(){
            return _implementation.getAppController();
        };
        api.getMetaController = function () {
            return _implementation.getMetaController();
        };
        api.getGroupVertexUnderMetaController = function () {
            return _implementation.getGroupVertexUnderMetaController();
        };
        api.getMetaRelationController = function(){
            return _implementation.getMetaRelationController();
        };
        api.canGetIsToTheLeft = function () {
            return !api.allowsMovingVertices();
        };
        api.expandGroupRelation = function (groupRelation) {
            return _implementation.expandGroupRelation(groupRelation);
        };
        api.reset = function () {
            publishAboutToUpdate();
            publishResetGraph();
            $("#drawn_graph").empty();
            GraphUi.removePopovers();
        };

        api.addNewGroupRelation = function (identifiers, parentBubble, addToLeft) {
            return _implementation.addNewGroupRelation(
                identifiers,
                parentBubble,
                addToLeft
            );
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
                    IdUri.htmlUrlForBubbleUri(centralBubbleUri)
                );
            }
            displayer(
                centralBubbleUri,
                function () {
                    publishDrawingInfoUpdated(
                        centralBubbleUri
                    );
                },
                errorCallback
            );
        }
    }
);