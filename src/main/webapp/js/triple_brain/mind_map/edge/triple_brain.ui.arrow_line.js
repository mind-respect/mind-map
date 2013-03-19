
/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "triple_brain.segment",
    "triple_brain.mind-map_template",
    "triple_brain.ui.graph"
],
    function(Segment, MindMapTemplate, GraphUi){
        var api = {};
        api.resetDrawingCanvas = function(){
            if ($("body").data(("canvas"))) {
                $("body").data("canvas").clear();
            }
            $("body").data(
                "canvas",
                Raphael(0, 0, $("body").width(), $("body").height())
            );
        };
        api.withSegment = function(segment){
            return new ArrowLine(segment);
        };
        api.ofSourceAndDestinationVertex = function(sourceVertex, destinationVertex){
            var segment = Segment.withStartAndEndPoint(
                sourceVertex.centerPoint(),
                destinationVertex.centerPoint()
            );
            try{
                segment.startPoint = sourceVertex.intersectionPointWithSegment(segment);
                segment.endPoint = destinationVertex.intersectionPointWithSegment(segment);
            }catch(error){
                segment = Segment.withStartAndEndPointAtOrigin();
            }
            return new ArrowLine(segment);
        };
        api.ofEdgeHavingUndefinedArrowLine = function(edge){
            return api.ofSourceAndDestinationVertex(
                edge.sourceVertex(),
                edge.destinationVertex()
            );
        };
        function ArrowLine(segment){
            var drawnComponents = [];
            var defaultStrokeWidth = "1";
            var defaultColor = "black";
            this.drawInWithDefaultStyle = function(){
                this.drawInBlackWithSmallLineWidth();
            }
            this.drawInBlackWithSmallLineWidth = function(){
                drawWithColorAndLineWidth(defaultColor, defaultStrokeWidth);
            }
            this.middlePoint = function(){
                return segment.middlePoint();
            }
            this.segment = function(){
                return segment
            }

            this.drawInYellowWithBigLineWidth = function(){
                drawWithColorAndLineWidth("yellow", "3");
            }

            this.remove = function(){
                while(drawnComponents.length != 0){
                    var drawnComponent =  drawnComponents.pop();
                    drawnComponent.remove();
                }
            }

            function drawWithColorAndLineWidth(color, lineWidth){
                drawLineOfArrow(color, lineWidth);
                drawArrowHeadOfArrow(defaultColor, defaultStrokeWidth);
            }
            function drawLineOfArrow(color, lineWidth){
                var arrowLinePath = "M" +
                    segment.startPoint.x +
                    " " +
                    segment.startPoint.y +
                    " L" +
                    segment.endPoint.x +
                    " "
                    + segment.endPoint.y + "Z";

                var canvas = GraphUi.canvas();
                drawnComponents.push(
                    canvas.path(arrowLinePath).
                    attr("stroke-width", lineWidth)
                    .attr("stroke", color)
                );
            }
            function drawArrowHeadOfArrow(color, lineWidth){
                var arrowHeadLength = 12;
                var lineAngle = segment.radianDirection();

                //angles for lines to make up arrow head
                var endAngle1 = lineAngle + 17 * Math.PI / 180;
                var endAngle2 = lineAngle - 17 * Math.PI / 180;

                var arrowHead = {};
                arrowHead.topSummit = segment.endPoint;
                arrowHead.summit2 = {};
                arrowHead.summit3 = {};

                arrowHead.summit2.y = arrowHead.topSummit.y - arrowHeadLength * Math.sin(endAngle1);
                arrowHead.summit3.y = arrowHead.topSummit.y - arrowHeadLength * Math.sin(endAngle2);
                arrowHead.summit2.x = arrowHead.topSummit.x - arrowHeadLength * Math.cos(endAngle1);
                arrowHead.summit3.x = arrowHead.topSummit.x - arrowHeadLength * Math.cos(endAngle2);

                var arrowHeadhPath =
                    "M" + arrowHead.summit2.x + " " +
                        arrowHead.summit2.y + " " +
                        "L" + arrowHead.topSummit.x + " " +
                        arrowHead.topSummit.y + " " +
                        "L" + arrowHead.summit3.x + " " +
                        arrowHead.summit3.y + "Z" ;

                var canvas = GraphUi.canvas();
                drawnComponents.push(
                    canvas.path(arrowHeadhPath)
                    .attr({
                        fill: color,
                        "stroke-width" : lineWidth
                    })
                );
            }
        }
        return api;
    }
);