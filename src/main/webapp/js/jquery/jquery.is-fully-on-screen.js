/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery"
],
    function ($) {
        $.fn.isFullyOnScreen = function () {
            var element = this;
            var docViewTop = $(window).scrollTop();
            var docViewBottom = docViewTop + $(window).height();

            var elemTop = $(element).offset().top;
            var elemBottom = elemTop + $(element).height();
            return ((docViewTop < elemTop) && (docViewBottom > elemBottom));
        };
    }
);
