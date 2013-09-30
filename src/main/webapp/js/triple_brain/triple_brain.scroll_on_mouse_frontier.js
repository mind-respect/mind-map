/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.point",
    "triple_brain.ui.utils"
], function ($, Point, UiUtils) {
    var scrollNumber = 40;
    return {
        doIt : function(){
            apply(
                $(".frontier.top"),
                0,
                -1 * scrollNumber
            );
            apply(
                $(".frontier.bottom"),
                0,
                scrollNumber
            );
            apply(
                $(".frontier.left"),
                -1 * scrollNumber,
                0
            );
            apply(
                $(".frontier.right"),
                scrollNumber,
                0
            );
        },
        disable: function(){
            $(".frontier").off(
                'mouseenter mouseleave'
            ).css("z-index", 0);
        }
    };
    function apply(frontier, x, y){
        frontier.hover(
            function(){
                var distanceToScroll = Point.fromCoordinates(
                    x,
                    y
                );
                var interval = setInterval(
                    scrollIfMouseOver,
                    150
                );
                function scrollIfMouseOver(){
                    if(frontier.is(":hover")){
                        scroll(distanceToScroll);
                    }else{
                        clearInterval(interval);
                    }
                }
            }
        ).css("z-index", 100);
    }
    function scroll(distanceToScroll){
        var scrollPosition = Point.fromCoordinates(
            UiUtils.getBrowserSafeScrollX(),
            UiUtils.getBrowserSafeScrollY()
        );
        var newScrollPosition = Point.sumOfPoints(
            distanceToScroll,
            scrollPosition
        );
        window.scrollTo(
            newScrollPosition.x,
            newScrollPosition.y
        );
    }
});