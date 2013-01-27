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
        }
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
        }

        api.componentPosition = function(component){
            return Point.fromCoordinates(
                $(component).offset().left,
                $(component).offset().top
            );
        }

        api.getBrowserSafeScrollX = function(){
            return Math.max($('body').scrollLeft(), $('html').scrollLeft());
        }

        api.getBrowserSafeScrollY = function(){
            return Math.max($('body').scrollTop(), $('html').scrollTop())
        }

        function isPositionVerticallyOffScreen(position) {
            return position.y < 10;
        }

        return api;

    }
)