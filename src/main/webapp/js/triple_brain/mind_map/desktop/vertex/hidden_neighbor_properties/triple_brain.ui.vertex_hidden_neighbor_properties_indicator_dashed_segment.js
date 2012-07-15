if (triple_brain.ui.vertex_hidden_neighbor_properties_indicator_dashed_segment == undefined) {

    triple_brain.ui.vertex_hidden_neighbor_properties_indicator_dashed_segment = {
        withSegment : function(segment){
            return new DashedSegment(segment);
        }
    }

    function DashedSegment(segment){
        var graph = triple_brain.ui.graph;
        var numberOfDashes = 3;
        var distanceBetweenEachDash = 5;
        var radianDirection = segment.radianDirection();
        var dash = segment;
        var graphCanvasContext = graph.canvasContext();
        this.draw = function(){
            for(j = 1 ; j <= numberOfDashes; j++){
                updateDashEndPoint();
                drawDash();
                updateDashStartPoint();
            }
        }
        function updateDashEndPoint(){
            dash.endPoint.x = dash.startPoint.x + distanceBetweenEachDash * Math.cos(radianDirection);
            dash.endPoint.y = dash.startPoint.y + distanceBetweenEachDash * Math.sin(radianDirection);
        }
        function drawDash(){
            graphCanvasContext.beginPath();
            var red = "#FF0000";
            graphCanvasContext.strokeStyle = red;
            graphCanvasContext.moveTo(dash.startPoint.x, dash.startPoint.y);
            graphCanvasContext.lineTo(dash.endPoint.x, dash.endPoint.y);
            graphCanvasContext.stroke();
        }
        function updateDashStartPoint(){
            dash.startPoint.x = dash.endPoint.x + distanceBetweenEachDash * Math.cos(radianDirection);
            dash.startPoint.y = dash.endPoint.y + distanceBetweenEachDash * Math.sin(radianDirection);
        }
    }
}