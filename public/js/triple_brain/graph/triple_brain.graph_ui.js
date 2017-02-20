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
            _isDragScrollEnabled = false,
            _isDragScrollLocked = false;
        api.initDragScroll = function () {
            var $body = $('body');
            var $toDragScroll = $body.scrollLeft() > 0 ? $body : $('html');
            $toDragScroll.addClass("dragscroll");
            DragScroll.reset();
        };
        api.addHtml = function (html) {
            api.getDrawnGraph().append(html);
        };
        api.getDrawnGraph = function () {
            if (!_drawnGraph) {
                _drawnGraph = $("#drawn_graph");
            }
            return _drawnGraph;
        };
        api.getZoom = function () {
            return parseFloat(
                $(".root-vertex-super-container").attr("data-zoom")
            );
        };
        api.zoom = function (zoomDifference) {
            var currentZoom = api.getZoom();
            var newZoom = currentZoom + zoomDifference;
            if (newZoom < 0.1) {
                newZoom = 0.1;
            }
            $(".root-vertex-super-container").attr(
                "data-zoom", newZoom
            ).css(
                "transform",
                "scale(" + newZoom + "," + newZoom + ")"
            );
        };
        api.getTopLayer = function () {
            if (!_topLayer) {
                _topLayer = $("body, html");
            }
            return _topLayer;
        };
        api.generateBubbleHtmlId = function () {
            _bubbleIdCounter++;
            return "bubble-ui-id-" + _bubbleIdCounter;
        };

        api.lockDragScroll = function(){
            _isDragScrollLocked = true;
        };

        api.unlockDragScroll = function(){
            _isDragScrollLocked = false;
        };

        api.disableDragScroll = function () {
            if(_isDragScrollLocked || !_isDragScrollEnabled){
                return;
            }
            DragScroll.disable();
            _isDragScrollEnabled = false;
        };
        api.enableDragScroll = function () {
            if(_isDragScrollLocked || _isDragScrollEnabled){
                return;
            }
            DragScroll.enable();
            _isDragScrollEnabled = true;
        };
        api.isDragScrollEnabled = function () {
            return _isDragScrollEnabled;
        };
        api.hideSchemaInstructions = function () {
            getSchemaInstructions().addClass("hidden");
        };
        api.showSchemaInstructions = function () {
            getSchemaInstructions().removeClass("hidden");
        };
        api.hasSelectedFromAutocomplete = function () {
            return $(".ui-autocomplete:visible").find(".ui-menu-item.focus").length > 0;
        };
        api.isDraggingBubble = function () {
            return _drawnGraph.data("isDraggingBubble") !== undefined &&
                _drawnGraph.data("isDraggingBubble");
        };
        api.setIsDraggingBubble = function (isDragging) {
            return api.getDrawnGraph().data("isDraggingBubble", isDragging);
        };
        return api;
        function getSchemaInstructions() {
            return $("#schema-instructions");
        }
    }
);
