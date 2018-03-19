/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery"
],
    function ($) {
        $.fn.isFullyOnScreen = function () {
            var element = $(this);
            var docViewTop = $(window).scrollTop();
            var docViewBottom = docViewTop + $(window).height();

            var elemTop = element.offset().top;
            var elemBottom = elemTop + element.height();
            if(!((docViewTop < elemTop) && (docViewBottom > elemBottom))){
                return false;
            }

            var docViewLeft = $(window).scrollLeft();
            var docViewRight = docViewLeft + $(window).width();

            var elemLeft = element.offset().left;
            var elemRight = elemLeft + element.width();
            return ((docViewLeft < elemLeft) && (docViewRight > elemRight));
        };
    }
);
