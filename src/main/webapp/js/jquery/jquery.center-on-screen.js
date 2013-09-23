/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
],
    function ($) {
        $.fn.centerOnScreen = function () {
            var element = this;
            var position = element.offset();
            window.scroll(
                scrollLeftFromPosition(position, element),
                scrollTopFromPosition(position, element)
            );
            return this;
        };
        $.fn.centerOnScreenWithAnimation = function () {
            var element = this;
            var position = element.offset();
            $('html, body').animate({
                scrollLeft: scrollLeftFromPosition(position, element),
                scrollTop: scrollTopFromPosition(position, element)
            }, 500);
            return this;
        };
        function scrollTopFromPosition(position, element){
            return position.top - screen.height / 4 + element.height() / 2;
        }
        function scrollLeftFromPosition(position, element){
            return position.left - screen.width / 2 + element.width() / 2;
        }

    }
);
