/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.point",
        "triple_brain.segment",
        "triple_brain.ui.utils"
    ],
    function ($, Point, Segment, UiUtils) {
        "use strict";
        $.fn.dragScroll = function (options) {
            if (this.data("disabled") !== undefined) {
                this.data("disabled", false);
                return;
            }
            this.data("dragScrollMouseUp", true);
            setUp(this, options);
        };

        $.fn.disableDragScroll = function () {
            console.log("disable dragscroll");
            if (this.data("disabled") !== undefined) {
                this.data("disabled", true);
            }
            return this;
        };

        function setUp($this, options) {
            $this.data("dragScrollMouseUp", true);
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

            $this.data(
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
            ).on(
                "mousemove",
                moveHandler
            ).mouseup(function () {
                    $this.data("dragScrollMouseUp", true);
                });
            var mousePosition,
                scrollContainer = $this.data("scrollContainer"),
                scrollContainerOffset = scrollContainer.offset(),
                getScrollPosition = $this.data("scrollPositionGetter"),
                isThereSubScrollContainer = $this.data("isThereSubScrollContainer");
            var lastPosition;
            return $this;
            function handleMouseDown(mouseDownEvent) {
                //mouseDownEvent.preventDefault();
                mouseDownEvent.stopPropagation();
                $this.data("dragScrollMouseUp", false);
            }

            function moveHandler(moveEvent) {
                console.log("move is disabled" + $this.data("disabled"));
                var disabledBefore = $this.data("disabled");
                if (disabledBefore || $this.data("dragScrollMouseUp")) {
                    return;
                }
                console.log("disabling in move");
                $this.data("disabled", true);
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
                $this.data("disabled", false);
                //function scroll() {
                //    lastPosition = lastPosition === undefined ?
                //        Point.fromPoint(mousePosition) :
                //        lastPosition;
                //    var movementSegment = Segment.withStartAndEndPoint(
                //        lastPosition,
                //        mousePosition
                //    );
                //    var distanceToScroll = getDistanceToScroll();
                //    var scrollPosition = getScrollPosition();
                //    var newScrollPosition = Point.sumOfPoints(
                //        distanceToScroll,
                //        scrollPosition
                //    );
                //    scrollContainer.scrollTop(newScrollPosition.y);
                //    scrollContainer.scrollLeft(newScrollPosition.x);
                //    lastPosition = Point.sumOfPoints(
                //        distanceToScroll,
                //        mousePosition
                //    );
                //    function getDistanceToScroll() {
                //        var distanceToScroll = movementSegment.length();
                //        distanceToScroll = distanceToScroll.invert();
                //        return distanceToScroll;
                //    }
                //}
            }
        }
    }
);

