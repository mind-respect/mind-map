/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery"
    ],
    function ($) {
        "use strict";
        var api = {},
            _drawnGraph,
            _topLayer,
            _bubbleIdCounter = 0,
            _isDragScrollEnabled = false;
        api.addHtml = function (html) {
            api.getDrawnGraph().append(html);
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
        api.disableDragScroll = function(){
            api.getDrawnGraph().disableDragScroll();
            _isDragScrollEnabled = false;
        };
        api.enableDragScroll = function(){
            api.getDrawnGraph().disableDragScroll().dragScroll();
            _isDragScrollEnabled = true;
        };
        api.isDragScrollEnabled = function(){
            return _isDragScrollEnabled;
        };
        return api;
    }
);
