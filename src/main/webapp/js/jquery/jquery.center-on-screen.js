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
                position.left - screen.width / 2 + element.width() / 2,
                position.top - screen.height / 4 + element.height() / 2
            );
            return this;
        };
        $.fn.centerOnScreenWithAnimation = function () {
            var element = this;
            var position = element.offset();
            $('html, body').animate({
                scrollTop: position.top - screen.height / 4 + element.height() / 2,
                scrollLeft: position.left - screen.width / 2 + element.width() / 2
            }, 500);
            return this;
        };
    }
);
