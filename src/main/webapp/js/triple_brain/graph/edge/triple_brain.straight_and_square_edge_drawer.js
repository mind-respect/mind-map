/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.ui.graph",
    "triple_brain.point",
    "triple_brain.segment"
], function(GraphUi, Point, Segment){
    var api = {};
    api.ofSourceAndDestinationVertex = function(sourceVertex, destinationVertex){
        return new PathBetweenVertices(sourceVertex, destinationVertex);
    };
    api.ofEdgeHavingUndefinedArrowLine = function(edge){
        return api.ofSourceAndDestinationVertex(
            edge.sourceVertex(),
            edge.destinationVertex()
        );
    };
    return api;
    function PathBetweenVertices(sourceVertex, destinationVertex){
        var drawnComponents = [];
        var sourceHtml = sourceVertex.textContainer();
        var destinationHtml = destinationVertex.textContainer();
        var defaultStrokeWidth = "1";
        var defaultColor = "black";
        this.drawInWithDefaultStyle = function(){
            this.drawInBlackWithSmallLineWidth();
        };
        this.drawInBlackWithSmallLineWidth = function(){
            var firstSegment = buildFirstSegment();
            var endPointOfSecondSegment = buildEndPointOfSecondSegment(
                firstSegment.getEndPoint()
            );
            var endPointOfThirdSegment = buildEndPointOfThirdSegment();
            var arrowLinePath = "M" +
                firstSegment.getStartPoint().x +
                " " +
                firstSegment.getStartPoint().y +
                lineToPoint(firstSegment.getEndPoint()) +
                lineToPoint(endPointOfSecondSegment) +
                lineToPoint(endPointOfThirdSegment)

            var canvas = GraphUi.canvas();
            drawnComponents.push(
                canvas.path(arrowLinePath).
                    attr("stroke-width", defaultStrokeWidth)
                    .attr("stroke", defaultColor)
            );
        };
        this.middlePoint = function(){
            return Point.centeredAtOrigin();
        };

        this.remove = function(){
            while(drawnComponents.length != 0){
                var drawnComponent =  drawnComponents.pop();
                drawnComponent.remove();
            }
        };

        function lineToPoint(point){
            return " L" +
                point.x +
                " " +
                point.y;
        }

        function buildFirstSegment(){
            var isGoingLeft = sourceHtml.offset().left > destinationHtml.offset().left;
            var sourcePoint = Point.fromCoordinates(
                sourceHtml.offset().left + (sourceVertex.textContainerWidth() / 2),
                sourceHtml.offset().top + 3
            );
            sourcePoint.y += false ?
                sourceHtml.outerHeight() / 2 :
                sourceHtml.outerHeight();
            var endPoint = Point.fromPoint(sourcePoint);
            var horizontalDistance = 40 + (sourceVertex.textContainerWidth() / 2);
            if(sourceVertex.hasImages()){
                horizontalDistance += 60;
            }
            endPoint.x += isGoingLeft ? -1 * horizontalDistance : horizontalDistance;
            return Segment.withStartAndEndPoint(
                sourcePoint,
                endPoint
            );
        }

        function buildEndPointOfSecondSegment(endPointOfLastSegment){
            return Point.fromCoordinates(
                endPointOfLastSegment.x,
                destinationHtml.offset().top + destinationHtml.outerHeight() + 3
            );
        }

        function buildEndPointOfThirdSegment(){
            return Point.fromCoordinates(
                destinationHtml.offset().left  + destinationVertex.textContainerWidth() / 2,
                destinationHtml.offset().top + destinationHtml.outerHeight() + 3
            );
        }
    }
});