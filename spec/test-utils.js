/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.vertex_server_format_builder",
    "triple_brain.identification",
    'triple_brain.vertex',
    'triple_brain.edge',
    "triple_brain.graph_displayer",
    "triple_brain.compare_flow"
], function ($, VertexServerFormatBuilder, Identification, Vertex, Edge, GraphDisplayer, CompareFlow) {
    "use strict";
    var api = {};
    api.generateVertexUri = function (userName) {
        userName = userName || "églantier";
        return "\/service\/users\/"+userName+"\/graph\/vertex\/" + generateUuid();
    };
    api.generateEdgeUri = function () {
        return "\/service\/users\/églantier\/graph\/edge\/" + generateUuid();
    };
    api.generateIdentificationUri = function () {
        return "\/service\/users\/églantier\/graph\/identification\/" + generateUuid();
    };
    api.dummyIdentifier = function () {
        return Identification.withUri(
            api.generateIdentificationUri()
        );
    };
    api.isGraphElementUiRemoved = function (element) {
        return element.getHtml().parents(".root-vertex-super-container").length === 0;
    };
    api.pressCtrlPlusKey = function (char) {
        api.pressKey(
            char, {ctrlKey: true}
        );
    };
    api.pressKey = function (char, options) {
        api.pressKeyCode(
            char.charCodeAt(0),
            options
        );
    };
    api.pressKeyCode = function (keyCode, options) {
        api._pressKeyCodeInContainer(
            keyCode,
            $("body"),
            options
        );
    };
    api.pressEnterInBubble = function (bubble) {
        api._pressKeyCodeInContainer(
            13,
            bubble.getLabel(),
            {}
        );
    };
    api.pressKeyInBubble = function (char, bubble) {
        bubble.getLabel().append(char);
        api._pressKeyCodeInContainer(
            char.charCodeAt(0),
            bubble.getLabel(),
            {}
        );
    };
    api.removeOneCharInBubble = function (bubble) {
        var text = bubble.getLabel().text();
        bubble.getLabel().text(
            text.substr(
                0,
                text.length - 1
            )
        );
        var backspaceKeyCode = 8;
        api._pressKeyCodeInContainer(
            backspaceKeyCode,
            bubble.getLabel(),
            {}
        );
    };
    api._pressKeyCodeInContainer = function (keyCode, container, options) {
        var event = $.Event("keydown");
        if (options !== undefined) {
            $.extend(event, options);
        }
        event.which = event.keyCode = keyCode;
        container.trigger(event);
    };
    api.getChildWithLabel = function (bubble, label) {
        var childWithLabel;
        bubble.visitAllImmediateChild(function (child) {
            if (child.text() === label) {
                childWithLabel = child;
                return false;
            }
        });
        expect(childWithLabel).not.toBeUndefined();
        return childWithLabel;
    };

    api.hasChildWithLabel = function (bubble, label) {
        var hasChild = false;
        bubble.visitAllImmediateChild(function (child) {
            if (child.text() === label) {
                hasChild = true;
                return false;
            }
        });
        return hasChild;
    };

    api.addTriple = function (bubble) {
        var destinationVertex = api.generateVertex(),
            edge = api.generateEdge(
                bubble.getUri,
                destinationVertex.getUri()
            );
        return GraphDisplayer.addEdgeAndVertex(
            bubble,
            edge,
            destinationVertex
        );
    };

    api.generateVertex = function () {
        return Vertex.fromServerFormat(
            VertexServerFormatBuilder.buildWithUri(
                api.generateVertexUri()
            )
        );
    };
    api.generateEdge = function (sourceVertexUri, destinationVertexUri) {
        return Edge.fromServerFormat(
            Edge.buildObjectWithUriOfSelfSourceAndDestinationVertex(
                api.generateEdgeUri(),
                sourceVertexUri,
                destinationVertexUri
            )
        );
    };
    api.startDragging = function (bubble) {
        var event = $.Event("dragstart");
        bubble.getHtml().trigger(event);
    };
    api.endDragging = function (bubble) {
        var event = $.Event("dragend");
        bubble.getHtml().trigger(event);
    };
    api.drop = function (bubble) {
        api._dropHtml(bubble.getLabel());
    };

    api._dropHtml = function (html) {
        var event = $.Event("drop");
        html.trigger(event);
    };

    api.moveAbove = function (moving, above) {
        api.startDragging(moving);
        api._dropHtml(
            above.getTreeContainer()
        );
        api.endDragging(moving);
    };

    api.singleIdentificationToMultiple = function (identification) {
        var multiple = {};
        multiple[identification.getExternalResourceUri()] = identification.getServerFormat();
        return multiple;
    };

    api.enterCompareFlowWithGraph = function (graph) {
        loadFixtures('compare-flow.html');
        CompareFlow.enter();
        CompareFlow._enterComparisonWithGraphAndCenterUri(
            graph,
            graph.getAnyUri()
        );
    };

    api.getIdentifierWithLabelInSubGraph = function(identifierLabel, subGraph){
        var identifierWithLabel;
        subGraph.visitGraphElements(function(graphElement){
            graphElement.getIdentifiers().forEach(function(identifier){
                if(identifier.getLabel() === identifierLabel){
                    identifierWithLabel = identifier;
                }
            });
        });
        return identifierWithLabel;
    };

    return api;

    function generateUuid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
});