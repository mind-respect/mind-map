/**
 * Copyright Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.point"
    ],
    function ($, Point) {
        "use strict";
        var api = {},
            htmlBody =  $("body"),
            _drawnGraph,
            _topLayer,
            _vertexIdCounter = 0;
        api.getEdgeMouseOver = function () {
            return htmlBody.data("edge_mouse_over");
        };
        api.setEdgeMouseOver = function (edge) {
            htmlBody.data("edge_mouse_over", edge);
        };
        api.unsetEdgeMouseOver = function () {
            htmlBody.removeData("edge_mouse_over");
        };
        api.addHtml = function (html) {
            api.getDrawnGraph().append(html);
        };
        api.canvas = function () {
            return htmlBody.data("canvas");
        };
        api.offset = function () {
            return Point.fromCoordinates(
                    htmlBody.width() / 2,
                    htmlBody.height() / 2
            );
        };
        api.getDrawnGraph = function(){
            if(!_drawnGraph){
                _drawnGraph = $("#drawn_graph");
            }
            return _drawnGraph;
        };
        api.getTopLayer = function(){
            if(!_topLayer){
                _topLayer = $("body, html");
            }
            return _topLayer;
        };
        api.generateVertexHtmlId = function(){
            _vertexIdCounter++;
            return "vertex-ui-id-" + _vertexIdCounter;
        };
        return api;
    }
);
