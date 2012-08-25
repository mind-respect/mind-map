/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain/mind_map/triple_brain.point",
    "triple_brain/mind_map/triple_brain.segment"
],
    function(require, $, Point, Segment) {
        return {
            start: function() {
                $("#graphCanvas").mousedown(function(){
                    var graphCanvas = this;
                    $(graphCanvas).data("mouseup", false);
                    var mousePosition;
                    $(graphCanvas).mousemove(moveHandler);
                    function moveHandler(moveEvent){
                        mousePosition = Point.fromCoordinates(
                            moveEvent.pageX,
                            moveEvent.pageY
                        );
                        $("#graphCanvas").unbind("mousemove");
                        scroll();
                        if(!$(graphCanvas).data("mouseup")){
                            $(graphCanvas).bind("mousemove", moveHandler);
                        }
                    }
                    $("body").mouseup(function(){
                        $(graphCanvas).unbind("mousemove");
                        $(graphCanvas).data("mouseup", true);
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
                        var distanceToScroll = distanceToScroll();
                        function distanceToScroll(){
                            var distanceToScroll = movementSegment.length();
                            distanceToScroll = distanceToScroll.invert();
                            distanceToScroll = distanceToScroll.multiply(1);
                            return distanceToScroll;
                        }
                        var scrollPosition = Point.fromCoordinates(
                            $("body").scrollLeft(),
                            $("body").scrollTop()
                        )
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
                    }
                });
            }
        };
    }
);

