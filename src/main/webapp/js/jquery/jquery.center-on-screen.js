/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery"
],
    function ($) {
        $.fn.centerOnScreen = function (options) {
            if(options === undefined){
                options = {};
            }
            var container = containerFromOptions(options);
            var visibleSize = visibleSizeFromOptions(options);
            var element = this;
            var elementOffset = element.offset();
            var containerOffset = container.offset();
            var position = {
                top : elementOffset.top - containerOffset.top,
                left : elementOffset.left - containerOffset.left
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
            if(options === undefined){
                options = {};
            }
            var container = containerFromOptions(options);
            var element = this;
            var position = element.offset();
            var visibleSize = visibleSizeFromOptions(options);
            container.animate({
                scrollLeft: scrollLeftFromPosition(position, element, visibleSize),
                scrollTop: scrollTopFromPosition(position, element, visibleSize)
            }, 500);
            return this;
        };

        function containerFromOptions(options){
            return options.container === undefined ?
                $('html, body') : options.container;
        }

        function scrollTopFromPosition(position, element, visibleSize){
            return position.top - visibleSize.y / 4 + element.height() / 2;
        }
        function scrollLeftFromPosition(position, element, visibleSize){
            return position.left - visibleSize.x / 2 + element.width() / 2;
        }

        function visibleSizeFromOptions(options){
            return options.containerVisibleSize === undefined ?
            {
                x : screen.width,
                y : screen.height
            } :
                options.containerVisibleSize;
        }

    }
);
