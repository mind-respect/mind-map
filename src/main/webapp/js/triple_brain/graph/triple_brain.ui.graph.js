/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.point"
],
    function ($, Point) {
        var api = {};
        api.getEdgeMouseOver = function () {
            return $("body").data("edge_mouse_over");
        };
        api.setEdgeMouseOver = function (edge) {
            $("body").data("edge_mouse_over", edge);
        };
        api.unsetEdgeMouseOver = function(){
            $("body").removeData("edge_mouse_over");
        };
        api.addHtml = function (html) {
            $("#drawn_graph").append(html);
        };
        api.resetDrawingCanvas = function(){
            var body = $("body");
            if (body.data(("canvas"))) {
                body.data("canvas").remove();
            }
            var paper = Raphael(0, 0, body.width(), body.height());
            paper.canvas.className.baseVal="main";
            body.data(
                "canvas",
                 paper
            );
        };
        api.canvas = function () {
            return $("body").data("canvas");
        };

        api.offset = function () {
            return Point.fromCoordinates(
                $("body").width() / 2,
                $("body").height() / 2
            );
        };
        return api;
    }
)
