/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.vertex_server_format_builder",
    'triple_brain.vertex',
    'triple_brain.edge',
    "triple_brain.graph_displayer"
], function ($, VertexServerFormatBuilder, Vertex, Edge, GraphDisplayer) {
    "use strict";
    var api = {};
    api.generateVertexUri = function () {
        return "\/service\/users\/foo\/graph\/vertex\/" + generateUuid();
    };
    api.generateEdgeUri = function () {
        return "\/service\/users\/foo\/graph\/edge\/" + generateUuid();
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
        var childWithLabel = bubble;
        bubble.visitAllChild(function (child) {
            if (child.text() === label) {
                childWithLabel = child;
                return false;
            }
        });
        return childWithLabel;
    };
    api.hasChildWithLabel = function (bubble, label) {
        var hasChild = false;
        bubble.visitAllChild(function (child) {
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
    api.startDragging = function(bubble){
        var event = $.Event("dragstart");
        bubble.getHtml().trigger(event);
    };
    api.endDragging = function(bubble){
        var event = $.Event("dragend");
        bubble.getHtml().trigger(event);
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