/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
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
            _bubbleIdCounter = 0;
        api.addHtml = function (html) {
            api.getDrawnGraph().append(html);
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
        api.generateBubbleHtmlId = function(){
            _bubbleIdCounter++;
            return "bubble-ui-id-" + _bubbleIdCounter;
        };
        return api;
    }
);
