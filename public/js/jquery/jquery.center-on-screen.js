/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery"
    ],
    function ($) {
        var BUFFER_FOR_HEADER_SIZE = 75;
        $.fn.centerOnScreen = function (options) {
            if (options === undefined) {
                options = {};
            }
            var container = containerFromOptions(options);
            var visibleSize = visibleSizeFromOptions(options);
            var element = this;
            var elementOffset = element.offset();
            var containerOffset = container.offset();
            var position = {
                top: elementOffset.top - containerOffset.top,
                left: elementOffset.left - containerOffset.left
            };
            container.scrollLeft(
                scrollLeftFromPosition(position, element, visibleSize)
            );
            container.scrollTop(
                scrollTopFromPosition(position, element, visibleSize)
            );
            return this;
        };
        $.fn.centerOnScreenWithAnimation = function (options) {
            return this.centerOnScreenWithAnimationAtPosition(
                options,
                {
                    forX: scrollLeftFromPosition,
                    forY: scrollTopFromPosition
                }
            )
        };

        $.fn.centerLeftSideOfScreenWithAnimation = function (options) {
            return this.centerOnScreenWithAnimationAtPosition(
                options,{
                    forX : scrollSideLeftFromPosition,
                    forY:scrollTopFromPosition
                }
            );
        };

        $.fn.centerRightSideOfScreenWithAnimation = function (options) {
            return this.centerOnScreenWithAnimationAtPosition(
                options,{
                    forX : scrollRightSideFromPosition,
                    forY:scrollTopFromPosition
                }
            );
        };

        $.fn.centerOnScreenWithAnimationAtPosition = function(options, scrollPositionGetter){
            options = options || {};
            options.duration = "750";
            var container = containerFromOptions(options);
            var element = this;
            var position = element.offset();
            var visibleSize = visibleSizeFromOptions(options);
            container.stop().animate({
                scrollLeft: scrollPositionGetter.forX(position, element, visibleSize),
                scrollTop: scrollPositionGetter.forY(position, element, visibleSize)
            }, options);
            return this;
        };

        function containerFromOptions(options) {
            return options.container === undefined ?
                $('html, body') : options.container;
        }

        function scrollTopFromPosition(position, element, visibleSize) {
            return position.top - visibleSize.y / 4 + element.height() / 2 - BUFFER_FOR_HEADER_SIZE;
        }

        function scrollLeftFromPosition(position, element, visibleSize) {
            return position.left - visibleSize.x / 2 + element.width() / 2;
        }

        function scrollRightSideFromPosition(position, element, visibleSize) {
            var scrollLeft = $(window).scrollLeft();
            return  scrollLeft - (
                    scrollLeft + visibleSize.x - position.left
                ) + element.width()
        }

        function scrollSideLeftFromPosition(position) {
            return position.left;
        }

        function visibleSizeFromOptions(options) {
            return options.containerVisibleSize === undefined ?
            {
                x: $(window).width(),
                y: screen.height
            } :
                options.containerVisibleSize;
        }

    }
);
