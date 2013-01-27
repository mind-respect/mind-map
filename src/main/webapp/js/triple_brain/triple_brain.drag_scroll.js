/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.point",
    "triple_brain.segment"
],
    function(require, $, Point, Segment) {
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
                            //html for firefox and body for chrome.
                            $("html, body").scrollLeft(),
                            $("html, body").scrollTop()
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
                            distanceToScroll = distanceToScroll.multiply(1);
                            return distanceToScroll;
                        }
                    }
                });
            }
        };
    }
);

