/*
 * Copyright Mozilla Public License 1.1
 */
define(
    [
        "jquery",
        "triple_brain.point"
    ],
    function($, Point){
        var api = {};
        api.positionLeft = function(componentToPosition, staticComponent){
            var horizontalBuffer = 16;
            var componentOffset = Point.fromCoordinates(
                ($(componentToPosition).width() * -1) - horizontalBuffer,
                $(staticComponent).height() / 2 - $(componentToPosition).height() / 2
            );

            var staticComponentPosition = api.componentPosition(staticComponent);

            var componentPosition = Point.sumOfPoints(
                staticComponentPosition,
                componentOffset
            );
            if (isPositionVerticallyOffScreen(componentPosition)) {
                componentPosition.y = 10;
            }

            $(componentToPosition).css('left', componentPosition.x);
            $(componentToPosition).css('top', componentPosition.y);
        };
        api.positionRight = function(componentToPosition, staticComponent){
            var componentOffset = Point.fromCoordinates(
                $(staticComponent).width(),
                $(staticComponent).height() / 2 - $(componentToPosition).height() / 2
            );

            var staticComponentPosition = api.componentPosition(staticComponent);

            var componentPosition = Point.sumOfPoints(
                staticComponentPosition,
                componentOffset
            );
            if (isPositionVerticallyOffScreen(componentPosition)) {
                componentPosition.y = 10;
            }

            $(componentToPosition).css('left', componentPosition.x);
            $(componentToPosition).css('top', componentPosition.y);
        };

        api.componentPosition = function(component){
            return Point.fromCoordinates(
                $(component).offset().left,
                $(component).offset().top
            );
        };

        api.getBrowserSafeScrollX = function(){
            return Math.max($('body').scrollLeft(), $('html').scrollLeft());
        };

        api.getBrowserSafeScrollY = function(){
            return Math.max($('body').scrollTop(), $('html').scrollTop())
        };

        api.doComponentsCollide = function($div1, $div2){
            var x1 = $div1.offset().left;
            var y1 = $div1.offset().top;
            var h1 = $div1.outerHeight(true);
            var w1 = $div1.outerWidth(true);
            var b1 = y1 + h1;
            var r1 = x1 + w1;

            var x2 = $div2.offset().left;
            var y2 = $div2.offset().top;
            var h2 = $div2.outerHeight(true);
            var w2 = $div2.outerWidth(true);
            var b2 = y2 + h2;
            var r2 = x2 + w2;

            return !(b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2);
        };

        api.isElementFullyOnScreen = function(element){
            var docViewTop = $(window).scrollTop();
            var docViewBottom = docViewTop + $(window).height();

            var elemTop = $(element).offset().top;
            var elemBottom = elemTop + $(element).height();
            var isOnScreenVertically = (docViewTop < elemTop) &&
                (docViewBottom > elemBottom);
            var docViewLeft = $(window).scrollLeft();
            var docViewRight = docViewLeft + $(window).width();
            var elemLeft = $(element).offset().left;
            var elemRight = elemLeft + $(element).width();
            var isOnScreenHorizontally = (docViewLeft < elemLeft) &&
                (docViewRight > elemRight);
            return isOnScreenVertically && isOnScreenHorizontally;
        };
        return api;
        function isPositionVerticallyOffScreen(position) {
            return position.y < 10;
        }
    }
)