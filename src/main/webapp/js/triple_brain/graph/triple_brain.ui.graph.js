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
            _topLayer;
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
        api.resetDrawingCanvas = function () {
            if (htmlBody.data(("canvas"))) {
                htmlBody.data("canvas").remove();
            }
            var paper = Raphael(0, 0, htmlBody.width(), htmlBody.height());
            paper.canvas.className.baseVal = "main";
            htmlBody.data(
                "canvas",
                paper
            );
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
                _topLayer = $("svg.main");
            }
            return _topLayer;
        };
        return api;
    }
);
