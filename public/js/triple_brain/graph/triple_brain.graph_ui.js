/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "dragscroll",
        "mr.color"
    ],
    function ($, DragScroll, Color) {
        "use strict";
        var DEFAULT_BACKGROUND_COLOR = "#1E87AF";
        var api = {},
            _drawnGraph,
            _topLayer,
            _bubbleIdCounter = 0,
            _isDragScrollEnabled = false,
            _isDragScrollLocked = false,
            _backgroundColor = DEFAULT_BACKGROUND_COLOR,
            _selectedBackgroundColor;

        api.refreshWidth = function () {
            var $leftContainer = $(".vertices-children-container.left-oriented");
            var $rightContainer = $(".vertices-children-container.right-oriented");
            var leftWidth = $leftContainer.find(".bubble").length * 750 +  2225;
            var rightWidth = $rightContainer.find(".bubble").length * 750 + 2225;
            $("#drawn_graph").css(
                "width",
                ((leftWidth + rightWidth) * 2) + "px"
            );
            $(".root-vertex-super-container").css(
                "width",
                (leftWidth + rightWidth + 800) + "px"
            );
            $leftContainer.css(
                "width",
                leftWidth
            );
            $rightContainer.css(
                "width",
                rightWidth
            );
        };

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

        api.lockDragScroll = function () {
            _isDragScrollLocked = true;
        };

        api.unlockDragScroll = function () {
            _isDragScrollLocked = false;
        };

        api.changeBackgroundColor = function (backgroundColor) {
            _backgroundColor = backgroundColor;
            api.defineSelectedBackgroundColor();
            $("#background-color-picker").val(backgroundColor);
            $("#drawn_graph").css(
                'background',
                "radial-gradient(rgba(0, 0, 0, 0) -10%, " + backgroundColor + " 100%"
            );
        };

        api.resetBackGroundColor = function () {
            api.changeBackgroundColor(DEFAULT_BACKGROUND_COLOR);
        };

        api.defineSelectedBackgroundColor = function () {
            var hsl = Color.hex2Hsl(_backgroundColor);
            _selectedBackgroundColor = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + 96 + '%)';
        };

        api.getSelectedBubbleBackgroundColor = function () {
            if (!_selectedBackgroundColor) {
                api.defineSelectedBackgroundColor();
            }
            return _selectedBackgroundColor;
        };

        api.disableDragScroll = function () {
            if (_isDragScrollLocked || !_isDragScrollEnabled) {
                return;
            }
            DragScroll.disable();
            _isDragScrollEnabled = false;
        };
        api.enableDragScroll = function () {
            if (_isDragScrollLocked || _isDragScrollEnabled) {
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
        api.removePopovers = function () {
            $(".popover").remove();
        };
        return api;

        function getSchemaInstructions() {
            return $("#schema-instructions");
        }
    }
);
