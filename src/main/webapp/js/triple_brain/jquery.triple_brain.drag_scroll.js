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
            var isThereSubScrollContainer = options.scrollContainer !== undefined,
                scrollContainer = isThereSubScrollContainer ? options.scrollContainer : $("body, html"),
                getScrollPosition = isThereSubScrollContainer ?
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
            return this.data(
                "isThereSubScrollContainer",
                isThereSubScrollContainer
            ).data(
                "scrollPositionGetter",
                getScrollPosition
            ).data(
                "scrollContainer",
                scrollContainer
            ).on(
                "mousedown",
                handleMouseDown
            );
        };

        $.fn.removeDragScroll = function () {
            return this.off(
                "mousedown",
                handleMouseDown
            ).off(
                "mousemove"
            ).off(
                "mouseup"
            );
        };

        function handleMouseDown(mouseDownEvent) {
            mouseDownEvent.stopPropagation();
            var $this = $(this),
                mousePosition,
                scrollContainer = $this.data("scrollContainer"),
                scrollContainerOffset = scrollContainer.offset(),
                getScrollPosition = $this.data("scrollPositionGetter"),
                isThereSubScrollContainer = $this.data("isThereSubScrollContainer");
            $this.data("dragScrollMouseUp", false);
            $this.mousemove(moveHandler);
            function moveHandler(moveEvent) {
                $this.off(moveEvent);
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
                if (!$this.data("dragScrollMouseUp")) {
                    $this.on("mousemove", moveHandler);
                }
            }

            scrollContainer.mouseup(function () {
                $this.off("mousemove", moveHandler);
                $this.data("dragScrollMouseUp", true);
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
    }
);

