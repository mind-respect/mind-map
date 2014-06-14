/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.graph_displayer"
], function (Point, Segment, GraphDisplayer) {
    var api = {};
    api.ofEdge = function (edge) {
        return new PathBetweenVertices(
            edge.sourceVertex(),
            edge.destinationVertex(),
            GraphDisplayer.couldDestinationBubbleAppearAsSourceBubble() &&
                edge.isInverse()
        );
    };
    return api;
    function PathBetweenVertices(sourceVertex, destinationVertex, isInverse) {
        var sourceVertexAsSeenOnScreen = isInverse ?
            destinationVertex :
            sourceVertex,
            destinationVertexAsSeenOnScreen = isInverse ?
            sourceVertex :
            destinationVertex;
        var drawnComponents = [],
            sourceHtml = sourceVertexAsSeenOnScreen.getInBubbleContainer(),
            destinationHtml = destinationVertexAsSeenOnScreen.getInBubbleContainer(),
            defaultStrokeWidth = "1",
            defaultColor = "black";
        this.drawInWithDefaultStyle = function () {
            this.drawInBlackWithSmallLineWidth();
        };
        this.drawInBlackWithSmallLineWidth = function () {
            return;
            var firstSegment = buildFirstSegment();
            var endPointOfSecondSegment = buildEndPointOfSecondSegment(
                firstSegment.getEndPoint()
            );
            var endPointOfThirdSegment = buildEndPointOfThirdSegment();
            var linePath = "M" +
                firstSegment.getStartPoint().x +
                " " +
                firstSegment.getStartPoint().y +
                lineToPoint(firstSegment.getEndPoint()) +
                lineToPoint(endPointOfSecondSegment) +
                lineToPoint(endPointOfThirdSegment);
            var canvas = sourceVertex.getHtml().closest(
                ".canvas-parent"
            ).data("canvas");
            drawnComponents.push(
                canvas.path(linePath).
                    attr("stroke-width", defaultStrokeWidth)
                    .attr("stroke", defaultColor)
            );
            addArrowHead();
            function addArrowHead() {
                var isGoingLeft = getIsGoingLeft();
                var isPointingLeft =
                    (isGoingLeft && !isInverse) ||
                        (!isGoingLeft && isInverse);

                var xDistance = isGoingLeft  ? -10 : 10;

                var arrowHeadEdgePoint = Point.fromCoordinates(
                    endPointOfSecondSegment.x + xDistance,
                    endPointOfSecondSegment.y
                );
                var headSize = 10;
                var directionFactor = isPointingLeft ?
                    -1 :
                    1;
                if(isGoingLeft){
                    if(!isInverse){
                        arrowHeadEdgePoint.x -= headSize;
                    }
                }else{
                    if(!isInverse){
                        arrowHeadEdgePoint.x += headSize;
                    }
                }
                var upperEnd = Point.fromCoordinates(
                    arrowHeadEdgePoint.x - headSize * directionFactor,
                    arrowHeadEdgePoint.y - headSize * directionFactor
                );
                var lowerEnd = Point.fromCoordinates(
                    arrowHeadEdgePoint.x - headSize * directionFactor,
                    arrowHeadEdgePoint.y + headSize * directionFactor
                );
                var arrowHeadPath = "M" +
                    arrowHeadEdgePoint.x +
                    " " +
                    arrowHeadEdgePoint.y +
                    lineToPoint(upperEnd) +
                    lineToPoint(arrowHeadEdgePoint) +
                    lineToPoint(lowerEnd);
                drawnComponents.push(
                    canvas.path(arrowHeadPath).
                        attr("stroke-width", defaultStrokeWidth)
                        .attr("stroke", defaultColor)
                );
            }
        };
        this.middlePoint = function () {
            return Point.centeredAtOrigin();
        };

        this.remove = function () {
            while (drawnComponents.length != 0) {
                var drawnComponent = drawnComponents.pop();
                drawnComponent.remove();
            }
        };

        function lineToPoint(point) {
            return " L" +
                point.x +
                " " +
                point.y;
        }

        function buildFirstSegment() {
            var isGoingLeft = getIsGoingLeft();
            var sourceHtmlOffset = getOffset(sourceHtml);
            var sourcePoint = Point.fromCoordinates(
                sourceHtmlOffset.left + (sourceHtml.outerWidth() / 2),
                sourceHtmlOffset.top
            );
            sourcePoint.y += sourceHtml.outerHeight() / 2;
            var endPoint = Point.fromPoint(sourcePoint);
            var horizontalDistance = 40 + (sourceHtml.outerWidth() / 2);
            if (isGoingLeft && sourceVertexAsSeenOnScreen.hasImages()) {
                horizontalDistance += 60;
            }
            endPoint.x += isGoingLeft ?
                -1 * horizontalDistance :
                horizontalDistance;
            return Segment.withStartAndEndPoint(
                sourcePoint,
                endPoint
            );
        }

        function getOffset(html) {
            return html.offset();
            //todo ... it doesnt work for now
//            var dialog = $(".ui-dialog-content");
//            if(dialog.length === 0){
//                return html.offset();
//            }
//            var d1ToD4 = html.offset().top;
//            var d1ToD2 = dialog.offset().top;
//            var d2ToD3 = dialog.scrollTop();
//            var d3ToD4 = Math.abs(d1ToD4 - (d1ToD2 + d2ToD3));
//            return {
//                top : d3ToD4,
//                left: html.offset().left - 13
//            }
        }

        function buildEndPointOfSecondSegment(endPointOfLastSegment) {
            return Point.fromCoordinates(
                endPointOfLastSegment.x,
                getOffset(destinationHtml).top + destinationHtml.outerHeight() / 2
            );
        }

        function buildEndPointOfThirdSegment() {
            var destinationHtmlOffset = getOffset(destinationHtml);
            return Point.fromCoordinates(
                destinationHtmlOffset.left + destinationVertexAsSeenOnScreen.getInBubbleContentWidth() / 2,
                destinationHtmlOffset.top + destinationHtml.outerHeight() / 2
            );
        }

        function getIsGoingLeft() {
            return sourceHtml.offset().left > destinationHtml.offset().left;
        }
    }
});