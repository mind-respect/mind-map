/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.ui.utils"
],
    function ($, Point, Segment, UiUtils) {
        $.fn.dragScroll = function (options) {
            if (options === undefined) {
                options = {};
            }
            var isThereSubScrollContainer = options.scrollContainer !== undefined;
            var scrollContainer = isThereSubScrollContainer ?
                options.scrollContainer : $("body, html");
            var getScrollPosition = isThereSubScrollContainer ?
                function () {
                    return Point.fromCoordinates(
                        scrollContainer.scrollLeft(),
                        scrollContainer.scrollTop()
                    );
                } :
                function () {
                    return Point.fromCoordinates(
                        UiUtils.getBrowserSafeScrollX(),
                        UiUtils.getBrowserSafeScrollY()
                    );
                };
            $(this).on(
                "mousedown",
                handleMouseDown
            );
            return this;
            function handleMouseDown() {
                var drawnGraph = this;
                $(drawnGraph).data("mouseup", false);
                var mousePosition;
                $(drawnGraph).mousemove(moveHandler);
                var scrollContainerOffset = scrollContainer.offset();
                function moveHandler(moveEvent) {
                    $(drawnGraph).unbind("mousemove");
                    var scrollAdjust = isThereSubScrollContainer ?
                        getScrollPosition() :
                        Point.fromCoordinates(
                            0,
                            0
                        );
                    mousePosition = Point.fromCoordinates(
                        moveEvent.pageX - scrollContainerOffset.left + scrollAdjust.x,
                        moveEvent.pageY - scrollContainerOffset.top + scrollAdjust.y
                    );
                    scroll();
                    if (!$(drawnGraph).data("mouseup")) {
                        $(drawnGraph).bind("mousemove", moveHandler);
                    }
                }

                scrollContainer.mouseup(function () {
                    $(drawnGraph).unbind("mousemove");
                    $(drawnGraph).data("mouseup", true);
                });
                var lastPosition;

                function scroll() {
                    lastPosition = lastPosition === undefined ?
                        Point.fromPoint(mousePosition) :
                        lastPosition;
                    var movementSegment = Segment.withStartAndEndPoint(
                        lastPosition,
                        mousePosition
                    );
                    var distanceToScroll = getDistanceToScroll();
                    var scrollPosition = getScrollPosition();
                    var newScrollPosition = Point.sumOfPoints(
                        distanceToScroll,
                        scrollPosition
                    );
                    scrollContainer.scrollTop(newScrollPosition.y);
                    scrollContainer.scrollLeft(newScrollPosition.x);
                    lastPosition = Point.sumOfPoints(
                        distanceToScroll,
                        mousePosition
                    );
                    function getDistanceToScroll() {
                        var distanceToScroll = movementSegment.length();
                        distanceToScroll = distanceToScroll.invert();
                        return distanceToScroll;
                    }
                }
            }
        };
    }
);

