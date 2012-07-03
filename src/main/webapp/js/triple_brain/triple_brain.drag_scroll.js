/*
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.drag_scroll== undefined) {
    (function($) {
        triple_brain.drag_scroll = {
            start: function() {
                $("#graphCanvas").mousedown(function(){
                    var graphCanvas = this;
                    $(graphCanvas).data("mouseup", false);
                    var mousePosition;
                    $(graphCanvas).mousemove(moveHandler);
                    function moveHandler(moveEvent){
                        mousePosition = point.fromCoordinates(
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
                            point.fromPoint(mousePosition) :
                            lastPosition;
                        var movementSegment = segment.withStartAndEndPoint(
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
                        var scrollPosition = point.fromCoordinates(
                            $("body").scrollLeft(),
                            $("body").scrollTop()
                        )
                        var newScrollPosition = point.sumOfPoints(
                            distanceToScroll,
                            scrollPosition
                        );
                        window.scrollTo(
                            newScrollPosition.x,
                            newScrollPosition.y
                        );
                        lastPosition = point.sumOfPoints(
                            distanceToScroll,
                            mousePosition
                        );
                    }
                });
            }
        };
    })(jQuery);
}