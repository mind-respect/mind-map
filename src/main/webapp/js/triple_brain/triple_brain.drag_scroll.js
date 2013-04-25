/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.ui.utils"
],
    function(require, $, Point, Segment, UiUtils) {
        var surfaceToDragScroll = $("svg");
        return {
            start: function() {
                $("svg").live("mousedown", function(mouseDownEvent){
                    var drawnGraph = this;
                    $(drawnGraph).data("mouseup", false);
                    var mousePosition;
                    $(drawnGraph).mousemove(moveHandler);
                    function moveHandler(moveEvent){
                        $(drawnGraph).unbind("mousemove");
                        mousePosition = Point.fromCoordinates(
                            moveEvent.pageX,
                            moveEvent.pageY
                        );
                        scroll();
                        if(!$(drawnGraph).data("mouseup")){
                            $(drawnGraph).bind("mousemove", moveHandler);
                        }
                    }
                    $("body").mouseup(function(){
                        $(drawnGraph).unbind("mousemove");
                        $(drawnGraph).data("mouseup", true);
                    });
                    var lastPosition;
                    function scroll(){
                        lastPosition = lastPosition === undefined ?
                            Point.fromPoint(mousePosition) :
                            lastPosition;
                        var movementSegment = Segment.withStartAndEndPoint(
                            lastPosition,
                            mousePosition
                        );
                        var distanceToScroll = getDistanceToScroll();
                        var scrollPosition = Point.fromCoordinates(
                            UiUtils.getBrowserSafeScrollX(),
                            UiUtils.getBrowserSafeScrollY()
                        );
                        var newScrollPosition = Point.sumOfPoints(
                            distanceToScroll,
                            scrollPosition
                        );
                        window.scrollTo(
                            newScrollPosition.x,
                            newScrollPosition.y
                        );
                        lastPosition = Point.sumOfPoints(
                            distanceToScroll,
                            mousePosition
                        );
                        function getDistanceToScroll(){
                            var distanceToScroll = movementSegment.length();
                            distanceToScroll = distanceToScroll.invert();
                            return distanceToScroll;
                        }
                    }
                });
            }
        };
    }
);

