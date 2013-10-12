/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.ui.graph",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.graph_displayer"
], function(GraphUi, Point, Segment, GraphDisplayer){
    var api = {};
    api.ofEdge = function(edge){
        var sourceVertexAsSeenOnScreen = edge.sourceVertex();
        var destinationVertexAsSeenOnScreen = edge.destinationVertex();
        if(GraphDisplayer.couldDestinationBubbleAppearAsSourceBubble()){
            if(edge.isInverse()){
                sourceVertexAsSeenOnScreen = edge.destinationVertex();
                destinationVertexAsSeenOnScreen = edge.sourceVertex();
            }
        }
        return new PathBetweenVertices(
            sourceVertexAsSeenOnScreen,
            destinationVertexAsSeenOnScreen
        );
    };
    return api;
    function PathBetweenVertices(sourceVertexAsSeenOnScreen, destinationVertexAsSeenOnScreen){
        var drawnComponents = [];
        var sourceHtml = sourceVertexAsSeenOnScreen.getTextContainer();
        var destinationHtml = destinationVertexAsSeenOnScreen.getTextContainer();
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
                lineToPoint(endPointOfThirdSegment);

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
                sourceHtml.offset().left + (sourceVertexAsSeenOnScreen.textContainerWidth() / 2),
                sourceHtml.offset().top
            );
            sourcePoint.y += sourceHtml.outerHeight() / 2;
            var endPoint = Point.fromPoint(sourcePoint);
            var horizontalDistance = 40 + (sourceVertexAsSeenOnScreen.textContainerWidth() / 2);
            if(sourceVertexAsSeenOnScreen.hasImages()){
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
                destinationHtml.offset().top + destinationHtml.outerHeight() / 2
            );
        }

        function buildEndPointOfThirdSegment(){
            return Point.fromCoordinates(
                destinationHtml.offset().left  + destinationVertexAsSeenOnScreen.textContainerWidth() / 2,
                destinationHtml.offset().top + destinationHtml.outerHeight() / 2
            );
        }
    }
});