/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.point",
    "triple_brain.ui.utils"
], function ($, Point, UiUtils) {
    var scrollNumber = 40,
        frontiers,
        topFrontier,
        bottomFrontier,
        leftFrontier,
        rightFrontier;
    return {
        doIt : function(){
            apply(
                getTopFrontier(),
                0,
                -1 * scrollNumber
            );
            apply(
                getBottomFrontier(),
                0,
                scrollNumber
            );
            apply(
                getLeftFrontier(),
                -1 * scrollNumber,
                0
            );
            apply(
                getRightFrontier(),
                scrollNumber,
                0
            );
        },
        disable: function(){
            getFrontiers().off(
                'mouseenter mouseleave'
            ).css("z-index", 0);
        }
    };

    function getTopFrontier(){
        if(!topFrontier){
            topFrontier = $(".frontier.top");
        }
        return topFrontier;
    }

    function getBottomFrontier(){
        if(!bottomFrontier){
            bottomFrontier = $(".frontier.bottom");
        }
        return bottomFrontier;
    }

    function getLeftFrontier(){
        if(!leftFrontier){
            leftFrontier = $(".frontier.left");
        }
        return leftFrontier;
    }

    function getRightFrontier(){
        if(!rightFrontier){
            rightFrontier = $(".frontier.right");
        }
        return rightFrontier;
    }

    function getFrontiers(){
        if(!frontiers){
            frontiers = $(".frontier");
        }
        return frontiers;
    }

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