/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.ui.graph",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.graph_displayer"
], function (GraphUi, Point, Segment, GraphDisplayer) {
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
            sourceVertex;
        var destinationVertexAsSeenOnScreen = isInverse ?
            sourceVertex :
            destinationVertex;
        var drawnComponents = [];
        var sourceHtml = sourceVertexAsSeenOnScreen.getTextContainer();
        var destinationHtml = destinationVertexAsSeenOnScreen.getTextContainer();
        var defaultStrokeWidth = "1";
        var defaultColor = "black";
        this.drawInWithDefaultStyle = function () {
            this.drawInBlackWithSmallLineWidth();
        };
        this.drawInBlackWithSmallLineWidth = function () {
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
            var canvas = GraphUi.canvas();
            drawnComponents.push(
                canvas.path(linePath).
                    attr("stroke-width", defaultStrokeWidth)
                    .attr("stroke", defaultColor)
            );
            addArrowHead();
            function addArrowHead() {
                var lastSegment = Segment.withStartAndEndPoint(
                    endPointOfSecondSegment,
                    endPointOfThirdSegment
                );
                var arrowHeadEdge = Segment.withStartAndEndPoint(
                    endPointOfSecondSegment,
                    lastSegment.middlePoint()
                ).middlePoint();
                var isGoingLeft = getIsGoingLeft();
                var headSize = 10;
                var directionFactor = isGoingLeft ?
                    isInverse ? 1 : -1 :
                    isInverse ? -1 : 1;

                if(isGoingLeft){
                    arrowHeadEdge = Segment.withStartAndEndPoint(
                        endPointOfSecondSegment,
                        arrowHeadEdge
                    ).middlePoint();
                    if(isInverse){
                        arrowHeadEdge.x += headSize;
                    }
                }
                var upperEnd = Point.fromCoordinates(
                    arrowHeadEdge.x - headSize * directionFactor,
                    arrowHeadEdge.y - headSize * directionFactor
                );
                var lowerEnd = Point.fromCoordinates(
                    arrowHeadEdge.x - headSize * directionFactor,
                    arrowHeadEdge.y + headSize * directionFactor
                );
                var arrowHeadPath = "M" +
                    arrowHeadEdge.x +
                    " " +
                    arrowHeadEdge.y +
                    lineToPoint(upperEnd) +
                    lineToPoint(arrowHeadEdge) +
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
            var sourcePoint = Point.fromCoordinates(
                sourceHtml.offset().left + (sourceVertexAsSeenOnScreen.textContainerWidth() / 2),
                sourceHtml.offset().top
            );
            sourcePoint.y += sourceHtml.outerHeight() / 2;
            var endPoint = Point.fromPoint(sourcePoint);
            var horizontalDistance = 40 + (sourceVertexAsSeenOnScreen.textContainerWidth() / 2);
            if (sourceVertexAsSeenOnScreen.hasImages()) {
                horizontalDistance += 60;
            }
            endPoint.x += isGoingLeft ? -1 * horizontalDistance : horizontalDistance;
            return Segment.withStartAndEndPoint(
                sourcePoint,
                endPoint
            );
        }

        function buildEndPointOfSecondSegment(endPointOfLastSegment) {
            return Point.fromCoordinates(
                endPointOfLastSegment.x,
                destinationHtml.offset().top + destinationHtml.outerHeight() / 2
            );
        }

        function buildEndPointOfThirdSegment() {
            return Point.fromCoordinates(
                destinationHtml.offset().left + destinationVertexAsSeenOnScreen.textContainerWidth() / 2,
                destinationHtml.offset().top + destinationHtml.outerHeight() / 2
            );
        }

        function getIsGoingLeft(){
            return sourceHtml.offset().left > destinationHtml.offset().left;
        }
    }
});