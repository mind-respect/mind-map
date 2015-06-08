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
    api.generateVertexUri = function(){
        return "\/service\/users\/foo\/graph\/vertex\/" + generateUuid();
    };
    api.generateEdgeUri = function(){
        return "\/service\/users\/foo\/graph\/edge\/" + generateUuid();
    };
    api.isGraphElementUiRemoved = function(element){
        return element.getHtml().parents(".root-vertex-super-container").length === 0;
    };
    api.pressCtrlPlusKey = function(char){
        api.pressKey(
            char, {ctrlKey: true}
        );
    };
    api.pressKey = function(char, options){
        api.pressKeyCode(
            char.charCodeAt(0),
            options
        );
    };
    api.pressKeyCode = function(keyCode, options){
        var event = $.Event("keydown");
        if(options !== undefined){
            $.extend(event, options);
        }
        event.which = event.keyCode = keyCode;
        $("body").trigger(event);
    };
    api.getChildWithLabel = function(bubble, label){
        var childWithLabel = bubble;
        bubble.visitAllChild(function(child){
            if(child.text() === label){
                childWithLabel = child;
                return false;
            }
        });
        return childWithLabel;
    };
    api.hasChildWithLabel = function(bubble, label){
        var hasChild = false;
        bubble.visitAllChild(function(child){
            if(child.text() === label){
                hasChild= true;
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

    api.generateVertex = function(){
        return Vertex.fromServerFormat(
            VertexServerFormatBuilder.buildWithUri(
                api.generateVertexUri()
            )
        );
    };
    api.generateEdge = function(sourceVertexUri, destinationVertexUri) {
        return Edge.fromServerFormat(
            Edge.buildObjectWithUriOfSelfSourceAndDestinationVertex(
                api.generateEdgeUri(),
                sourceVertexUri,
                destinationVertexUri
            )
        );
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