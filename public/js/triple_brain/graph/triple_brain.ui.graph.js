/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "dragscroll"
    ],
    function ($, DragScroll) {
        "use strict";
        var api = {},
            _drawnGraph,
            _topLayer,
            _bubbleIdCounter = 0,
            _isDragScrollEnabled = false;
        api.initDragScroll = function(){
            var $body = $('body');
            var $html = $('html');
            if($body.scrollLeft() > 0){
                $body.addClass("dragscroll");
                return;
            }
            if($html.scrollLeft() > 0){
                $html.addClass("dragscroll");
            }
            DragScroll.reset();
        };
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
            DragScroll.disable();
            _isDragScrollEnabled = false;
        };
        api.enableDragScroll = function(){
            DragScroll.enable();
            _isDragScrollEnabled = true;
        };
        api.isDragScrollEnabled = function(){
            return _isDragScrollEnabled;
        };
        api.hideSchemaInstructions = function(){
            getSchemaInstructions().addClass("hidden");
        };
        api.showSchemaInstructions = function(){
            getSchemaInstructions().removeClass("hidden");
        };
        return api;
        function getSchemaInstructions(){
            return $("#schema-instructions");
        }
    }
);
