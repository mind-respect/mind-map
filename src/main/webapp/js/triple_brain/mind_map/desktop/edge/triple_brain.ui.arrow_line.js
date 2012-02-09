
/**
 * @author Vincent Blouin
 */

if (triple_brain.ui.arrow_line == undefined) {

    triple_brain.ui.arrow_line  = {
        withSegment : function(segment){
            return new ArrowLine(segment)
        },
        ofSourceAndDestinationVertex : function(sourceVertex, destinationVertex){
            var segment = triple_brain.segment.withStartAndEndPoint(
                sourceVertex.centerPoint(),
                destinationVertex.centerPoint()
            );
            try{
                segment.startPoint = sourceVertex.intersectionPointWithSegment(segment);
                segment.endPoint = destinationVertex.intersectionPointWithSegment(segment);
            }catch(error){
                segment = triple_brain.segment.withStartAndEndPointAtOrigin();
            }
            return new ArrowLine(segment);
        }
    }

    function ArrowLine(segment){
        this.drawInContextWithDefaultStyle = function(canvasContext){
            canvasContext.lineWidth = 1;
            canvasContext.strokeStyle = "#333";
            this.drawInContext(canvasContext);
        }
        this.drawInContext = function(canvasContext){
            canvasContext.beginPath();
            canvasContext.moveTo(segment.startPoint.x, segment.startPoint.y);
            canvasContext.lineTo(segment.endPoint.x, segment.endPoint.y);
            canvasContext.stroke();

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

            canvasContext.beginPath();
            canvasContext.moveTo(arrowHead.topSummit.x, arrowHead.topSummit.y);
            canvasContext.lineTo(arrowHead.summit2.x, arrowHead.summit2.y);
            canvasContext.lineTo(arrowHead.summit3.x, arrowHead.summit3.y);
            canvasContext.lineTo(arrowHead.topSummit.x, arrowHead.topSummit.y);
            canvasContext.fill();
        }
        this.middlePoint = function(){
            return segment.middlePoint();
        }
        this.segment = function(){
            return segment
        }
    }
}